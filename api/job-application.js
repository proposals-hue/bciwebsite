const { del, get } = require('@vercel/blob');
const { erpFetch, erpUploadFile, sendJson, holdResponse } = require('./_erp');
const { validateResumeContents, validateResumeMetadata } = require('./_resume');
const { validatePhotoContents, validatePhotoMetadata } = require('./_photo');

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

async function readResumeBlob(file) {
  if (!file || typeof file !== 'object') {
    const error = new Error('Please attach your CV.');
    error.statusCode = 400;
    throw error;
  }

  let parsedUrl;
  try { parsedUrl = new URL(String(file.url || '')); }
  catch (_) {
    const error = new Error('The uploaded CV reference is invalid.');
    error.statusCode = 400;
    throw error;
  }
  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.private.blob.vercel-storage.com')) {
    const error = new Error('The uploaded CV reference is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const declared = validateResumeMetadata(file);
  const result = await get(parsedUrl.href, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream || !result.blob.pathname.startsWith('job-cvs/')) {
    const error = new Error('The uploaded CV could not be found.');
    error.statusCode = 400;
    throw error;
  }

  const stored = validateResumeMetadata({
    name: declared.filename,
    type: result.blob.contentType,
    size: result.blob.size,
  });
  if (stored.size !== declared.size || stored.contentType !== declared.contentType) {
    const error = new Error('The uploaded CV details do not match the stored file.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  if (buffer.length !== stored.size) {
    const error = new Error('The uploaded CV is incomplete.');
    error.statusCode = 400;
    throw error;
  }
  validateResumeContents(buffer, stored.extension);
  return { buffer, filename: stored.filename, contentType: stored.contentType };
}

async function readPhotoBlob(file) {
  if (!file || typeof file !== 'object') {
    const error = new Error('Please attach a recent photo.');
    error.statusCode = 400;
    throw error;
  }

  let parsedUrl;
  try { parsedUrl = new URL(String(file.url || '')); }
  catch (_) {
    const error = new Error('The uploaded photo reference is invalid.');
    error.statusCode = 400;
    throw error;
  }
  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.private.blob.vercel-storage.com')) {
    const error = new Error('The uploaded photo reference is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const declared = validatePhotoMetadata(file);
  const result = await get(parsedUrl.href, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream || !result.blob.pathname.startsWith('job-photos/')) {
    const error = new Error('The uploaded photo could not be found.');
    error.statusCode = 400;
    throw error;
  }
  const stored = validatePhotoMetadata({
    name: declared.filename,
    type: result.blob.contentType,
    size: result.blob.size,
  });
  if (stored.size !== declared.size || stored.contentType !== declared.contentType) {
    const error = new Error('The uploaded photo details do not match the stored file.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  if (buffer.length !== stored.size) {
    const error = new Error('The uploaded photo is incomplete.');
    error.statusCode = 400;
    throw error;
  }
  validatePhotoContents(buffer, stored.extension);
  return { buffer, filename: stored.filename, contentType: stored.contentType };
}

// Files sent inline (base64 inside the JSON body) skip Blob staging entirely.
// The Careers page does this whenever the CV and photo fit Vercel's 4.5 MB
// request limit, and falls back to Blob staging only for larger CVs.
function readInlineFile(file, missingMessage, validateMetadata, validateContents) {
  const buffer = Buffer.from(typeof file?.data === 'string' ? file.data : '', 'base64');
  if (!buffer.length) {
    const error = new Error(missingMessage);
    error.statusCode = 400;
    throw error;
  }
  const stored = validateMetadata({ name: file.name, type: file.type, size: buffer.length });
  validateContents(buffer, stored.extension);
  return { buffer, filename: stored.filename, contentType: stored.contentType };
}

// ERP validates Job Applicant `phone_number` as a Phone field: at most 20 of
// digits, spaces and + - _ ( ) . , * #. Applicants type Arabic-Indic digits,
// labels ("WhatsApp: …") or two numbers, and ERP then rejects the whole
// application. Convert the digits and drop the rest; when it still does not
// fit, leave the field empty — the number as typed goes in the cover letter.
const ERP_PHONE = /^[0-9 +_\-,.*#()]{1,20}$/;

function normalizePhone(value) {
  const latin = value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
  const phone = latin
    .replace(/[^0-9 +_\-,.*#()]+/g, ' ')
    .replace(/^[^0-9+(]+|[^0-9)]+$/g, '')
    .replace(/\s+/g, ' ');
  const valid = ERP_PHONE.test(phone);
  return { phone: valid ? phone : '', asTyped: valid && phone === latin ? '' : value };
}

// A vacancy title is free text on the ERP request, but Job Applicant
// `designation` is a Link to Designation: an unmatched title (e.g. a typo on
// the request) makes ERP reject the whole application. Link it only when the
// Designation exists — the title is always in the cover letter regardless.
async function matchDesignation(title) {
  try {
    const payload = await erpFetch(`/api/resource/Designation/${encodeURIComponent(title)}`);
    return clean(payload.data?.name, 180);
  } catch (error) {
    if (error.statusCode === 404) return '';
    throw error;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // Reply only after the staged files are deleted — see holdResponse in _erp.js.
  const reply = holdResponse(res);
  let temporaryBlobUrl = '';
  let temporaryPhotoBlobUrl = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    temporaryBlobUrl = clean(body.resume_blob?.url, 1000);
    temporaryPhotoBlobUrl = clean(body.photo_blob?.url, 1000);
    if (body.website) return sendJson(reply, 200, { ok: true }); // honeypot

    const applicantName = clean(body.name, 140);
    const email = clean(body.email, 180).toLowerCase();
    const { phone, asTyped: phoneAsTyped } = normalizePhone(clean(body.phone, 40));
    const position = clean(body.position, 180);
    const designation = clean(body.designation, 180);
    const coverNote = clean(body.cover_letter, 5000);
    const jobOpening = clean(body.job_opening, 180);
    const requestReference = clean(body.request_reference, 180);

    if (!applicantName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(reply, 400, { error: 'Please provide a valid name and email address.' });
    }
    if (!position || !designation) {
      return sendJson(reply, 400, { error: 'Please select the position you are applying for.' });
    }
    // Applications are accepted only against a published vacancy; there is no
    // open / "other position" route.
    if (!jobOpening && !requestReference) {
      return sendJson(reply, 400, { error: 'Please select one of the open positions.' });
    }
    const [resume, photo] = await Promise.all([
      body.resume_file
        ? readInlineFile(body.resume_file, 'Please attach your CV.', validateResumeMetadata, validateResumeContents)
        : readResumeBlob(body.resume_blob),
      body.photo_file
        ? readInlineFile(body.photo_file, 'Please attach a recent photo.', validatePhotoMetadata, validatePhotoContents)
        : readPhotoBlob(body.photo_blob),
    ]);
    const designationName = await matchDesignation(designation);

    const referenceLine = requestReference ? `ERP request: ${requestReference}\n` : '';
    const phoneLine = phoneAsTyped ? `Phone (as typed): ${phoneAsTyped}\n` : '';
    const data = {
      applicant_name: applicantName,
      email_id: email,
      phone_number: phone,
      cover_letter: `Position applied for: ${position}\n${referenceLine}${phoneLine}\n${coverNote}`.trim(),
    };
    if (jobOpening) data.job_title = jobOpening;
    if (designationName) data.designation = designationName;
    // This ERP already has the standard "Website Listing" source. Always use
    // it unless deployment explicitly selects another valid source record, so
    // website applicants are filterable and do not arrive with Source blank.
    data.source = clean(process.env.ERP_JOB_APPLICANT_SOURCE, 140) || 'Website Listing';
    if (requestReference) {
      data[clean(process.env.ERP_JOB_APPLICANT_REFERENCE_FIELD, 140) || 'custom_job_request'] = requestReference;
      // ERP's "Link Recruitment Request" script reads this field. Left empty, it
      // searches for an *Open* request with the same title instead, and rejects
      // every vacancy HR has moved on to Interviewed or Offered, though the
      // website keeps listing those until Selected or Cancelled.
      data.request_for_job_applicant = requestReference;
    }

    const payload = await erpFetch('/api/resource/Job Applicant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const applicationId = payload.data?.name;
    if (!applicationId) throw new Error('ERP did not return the Job Applicant ID');

    const upload = await erpUploadFile({
      ...resume,
      doctype: 'Job Applicant',
      docname: applicationId,
      fieldname: 'resume_attachment',
    });
    const resumeUrl = upload.message?.file_url || upload.data?.file_url || '';
    if (!resumeUrl) throw new Error('ERP did not return the uploaded CV URL');

    const photoUpload = await erpUploadFile({
      ...photo,
      doctype: 'Job Applicant',
      docname: applicationId,
      fieldname: 'custom_applicant_photo',
    });
    const photoUrl = photoUpload.message?.file_url || photoUpload.data?.file_url || '';
    if (!photoUrl) throw new Error('ERP did not return the uploaded photo URL');

    await erpFetch(`/api/resource/Job Applicant/${encodeURIComponent(applicationId)}`, {
      method: 'PUT',
      body: JSON.stringify({
        resume_attachment: resumeUrl,
        resume_link: '',
        custom_applicant_photo: photoUrl,
      }),
    });
    return sendJson(reply, 201, { ok: true, application_id: applicationId });
  } catch (error) {
    console.error('ERP job application failed:', error.message);
    // ERP answers a field it refuses (an email it will not accept, a server
    // script rule) with 417 and a readable reason; show that reason instead of
    // a generic apology, so the applicant can fix it and the failure explains
    // itself. Anything else stays generic, with the cause in the function log.
    const erpReason = (error.statusCode === 417 || error.statusCode === 409)
      ? String(error.erpMessage || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
      : '';
    if (erpReason) {
      return sendJson(reply, 400, { error: `We could not accept the application: ${erpReason}` });
    }
    const status = error.statusCode === 400 ? 400 : (error.statusCode === 503 ? 503 : 502);
    const message = status === 400
      ? error.message
      : 'We could not register the application in ERP. Please try again.';
    return sendJson(reply, status, { error: message });
  } finally {
    if (temporaryBlobUrl) {
      try { await del(temporaryBlobUrl); }
      catch (error) { console.error('Temporary CV cleanup failed:', error.message); }
    }
    if (temporaryPhotoBlobUrl) {
      try { await del(temporaryPhotoBlobUrl); }
      catch (error) { console.error('Temporary photo cleanup failed:', error.message); }
    }
    reply.flush();
  }
};
