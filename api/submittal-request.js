const { del } = require('@vercel/blob');
const { erpFetch, erpUploadFile, sendJson } = require('./_erp');
const { readPrivateBlob } = require('./_rfq-file');
const { fetchWebsiteItem } = require('./_website-item');

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// The doctype makes the specification attachment mandatory, so the file has to
// exist in ERP *before* the Submittal Request is inserted. It is uploaded
// unattached — Frappe rejects an upload that names a doctype without a docname
// — referenced by URL on insert, then linked back to the new document so ERP
// permissions on the request also govern the private file.
async function uploadSpecification(file) {
  const upload = await erpUploadFile(file);
  const uploaded = upload.message || upload.data || {};
  const fileUrl = uploaded.file_url || '';
  if (!fileUrl) throw new Error('ERP did not return the uploaded file URL');
  return { fileUrl, fileName: uploaded.name || '' };
}

async function linkSpecification(fileName, docname) {
  if (!fileName) return false;
  try {
    await erpFetch(`/api/resource/File/${encodeURIComponent(fileName)}`, {
      method: 'PUT',
      body: JSON.stringify({
        attached_to_doctype: 'Submittal Request',
        attached_to_name: docname,
        attached_to_field: 'project_specification',
      }),
    });
    return true;
  } catch (error) {
    console.error(`Submittal Request ${docname} specification linking failed:`, error.message);
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let specBlobUrl = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    specBlobUrl = clean(body.spec_blob?.url, 1000);
    const contactPerson = clean(body.contact_person, 140);
    const companyName = clean(body.company_name, 140);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone_no, 40);
    const itemCode = clean(body.item_code, 240);
    const projectName = clean(body.project_name, 240);
    const projectLocation = clean(body.project_location, 240);
    const projectArea = clean(body.project_area, 140);
    const alternativeMaterial = clean(body.alternative_material, 2000);
    const otherDetails = clean(body.other_details, 5000);
    const source = clean(body.source, 300);
    const pageUrl = clean(body.page_url, 1000);
    const lang = clean(body.lang, 10);

    if (!contactPerson || !companyName) {
      throw badRequest('Please provide the contact person and company name.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw badRequest('Please provide a valid email address — the submittal is sent there.');
    }
    if (!projectName || !projectLocation) {
      throw badRequest('Please provide the project name and location.');
    }
    if (!specBlobUrl) throw badRequest('Please attach the project specification.');

    const [item, specification] = await Promise.all([
      fetchWebsiteItem(itemCode),
      readPrivateBlob(body.spec_blob, 'spec'),
    ]);
    if (!specification) throw badRequest('Please attach the project specification.');

    const contextLines = [
      `Requested by: ${contactPerson}`,
      `Company: ${companyName}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : '',
      source ? `Website source: ${source}` : '',
      lang ? `Website language: ${lang}` : '',
      pageUrl ? `Website page: ${pageUrl}` : '',
    ].filter(Boolean);

    const { fileUrl, fileName } = await uploadSpecification(specification);

    const payload = await erpFetch('/api/resource/Submittal Request', {
      method: 'POST',
      body: JSON.stringify({
        item: item.name,
        project_specification: fileUrl,
        project_name: projectName,
        project_location: projectLocation,
        project_area: projectArea,
        alternative_material: alternativeMaterial,
        other_details: [...contextLines, otherDetails].filter(Boolean).join('\n'),
        custom_requester_name: contactPerson,
        custom_company_name: companyName,
        custom_email: email,
        custom_phone: phone,
      }),
    });
    const requestId = payload.data?.name;
    if (!requestId) throw new Error('ERP did not return the Submittal Request ID');

    const linked = await linkSpecification(fileName, requestId);

    return sendJson(res, 201, {
      ok: true,
      request_id: requestId,
      attachment_warning: !linked,
    });
  } catch (error) {
    console.error('ERP Submittal Request submission failed:', error.message);
    const status = error.statusCode === 400 ? 400 : (error.statusCode === 503 ? 503 : 502);
    return sendJson(res, status, {
      error: status === 400
        ? error.message
        : 'We could not register the submittal request in ERP. Please try again.',
    });
  } finally {
    if (specBlobUrl) {
      try { await del(specBlobUrl); }
      catch (error) { console.error('Temporary submittal file cleanup failed:', error.message); }
    }
  }
};
