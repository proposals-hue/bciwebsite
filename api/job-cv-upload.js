const { handleUpload } = require('@vercel/blob/client');
const { sendJson } = require('./_erp');
const {
  ALLOWED_CONTENT_TYPES,
  MAX_RESUME_BYTES,
  safeResumeName,
  validateResumeMetadata,
} = require('./_resume');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let details = {};
        try { details = JSON.parse(clientPayload || '{}'); }
        catch (_) { throw new Error('Invalid CV upload request.'); }

        const metadata = validateResumeMetadata(details);
        const expectedPath = `job-cvs/${safeResumeName(details.name)}`;
        if (pathname !== expectedPath || !pathname.startsWith('job-cvs/')) {
          throw new Error('Invalid CV upload path.');
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_RESUME_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            filename: metadata.filename,
            size: metadata.size,
            contentType: metadata.contentType,
          }),
        };
      },
    });
    return sendJson(res, 200, result);
  } catch (error) {
    console.error('CV upload authorization failed:', error.message);
    return sendJson(res, 400, { error: error.message || 'CV upload could not be authorized.' });
  }
};
