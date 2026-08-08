const { handleUpload } = require('@vercel/blob/client');
const { sendJson } = require('./_erp');
const {
  ALLOWED_PHOTO_CONTENT_TYPES,
  MAX_PHOTO_BYTES,
  safePhotoName,
  validatePhotoMetadata,
} = require('./_photo');

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
        catch (_) { throw new Error('Invalid photo upload request.'); }

        const metadata = validatePhotoMetadata(details);
        const expectedPath = `job-photos/${safePhotoName(details.name)}`;
        if (pathname !== expectedPath || !pathname.startsWith('job-photos/')) {
          throw new Error('Invalid photo upload path.');
        }

        return {
          allowedContentTypes: ALLOWED_PHOTO_CONTENT_TYPES,
          maximumSizeInBytes: MAX_PHOTO_BYTES,
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
    console.error('Photo upload authorization failed:', error.message);
    return sendJson(res, 400, { error: error.message || 'Photo upload could not be authorized.' });
  }
};
