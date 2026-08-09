const { del, get } = require('@vercel/blob');
const { erpFetch, erpUploadFile, sendJson } = require('./_erp');
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let temporaryBlobUrl = '';
  let temporaryPhotoBlobUrl = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    temporaryBlobUrl = clean(body.resume_blob?.url, 1000);
    temporaryPhotoBlobUrl = clean(body.photo_blob?.url, 1000);
    if (body.website) return sendJson(res, 200, { ok: true }); // honeypot

    const applicantName = clean(body.name, 140);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone, 40);
    const position = clean(body.position, 180);
    const designation = clean(body.designation, 180);
    const coverNote = clean(body.cover_letter, 5000);
    const jobOpening = clean(body.job_opening, 180);
    const requestReference = clean(body.request_reference, 180);

    if (!applicantName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(res, 400, { error: 'Please provide a valid name and email address.' });
    }
    if (!position || !designation) {
      return sendJson(res, 400, { error: 'Please select the position you are applying for.' });
    }
    if (!jobOpening && !requestReference) {
      try {
        await erpFetch(`/api/resource/Designation/${encodeURIComponent(designation)}`);
      } catch (error) {
        if (error.statusCode === 404) {
          return sendJson(res, 400, { error: 'Please select a valid ERP position.' });
        }
        throw error;
      }
    }
    const [resume, photo] = await Promise.all([
      readResumeBlob(body.resume_blob),
      readPhotoBlob(body.photo_blob),
    ]);

    const referenceLine = requestReference ? `ERP request: ${requestReference}\n` : '';
    const data = {
      applicant_name: applicantName,
      email_id: email,
      phone_number: phone,
      cover_letter: `Position applied for: ${position}\n${referenceLine}\n${coverNote}`.trim(),
    };
    if (jobOpening) data.job_title = jobOpening;
    // Vacancy positions and other-position choices both map to ERP Designation.
    data.designation = designation;
    // This ERP already has the standard "Website Listing" source. Always use
    // it unless deployment explicitly selects another valid source record, so
    // website applicants are filterable and do not arrive with Source blank.
    data.source = clean(process.env.ERP_JOB_APPLICANT_SOURCE, 140) || 'Website Listing';
    if (requestReference) {
      data[clean(process.env.ERP_JOB_APPLICANT_REFERENCE_FIELD, 140) || 'custom_job_request'] = requestReference;
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
    return sendJson(res, 201, { ok: true, application_id: applicationId });
  } catch (error) {
    console.error('ERP job application failed:', error.message);
    const status = error.statusCode === 400 ? 400 : (error.statusCode === 503 ? 503 : 502);
    const message = status === 400
      ? error.message
      : 'We could not register the application in ERP. Please try again.';
    return sendJson(res, status, { error: message });
  } finally {
    if (temporaryBlobUrl) {
      try { await del(temporaryBlobUrl); }
      catch (error) { console.error('Temporary CV cleanup failed:', error.message); }
    }
    if (temporaryPhotoBlobUrl) {
      try { await del(temporaryPhotoBlobUrl); }
      catch (error) { console.error('Temporary photo cleanup failed:', error.message); }
    }
  }
};
