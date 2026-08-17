const { handleUpload } = require('@vercel/blob/client');
const { sendJson } = require('./_erp');
const {
  allowedRfqContentTypes,
  blobPathPrefix,
  maxFileBytes,
  safeRfqFileName,
  validateRfqFileMetadata,
} = require('./_rfq-file');

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
        catch (_) { throw new Error('Invalid file upload request.'); }

        const metadata = validateRfqFileMetadata(details);
        const prefix = blobPathPrefix(metadata.kind);
        if (pathname !== `${prefix}${safeRfqFileName(details.name)}`) {
          throw new Error('Invalid file upload path.');
        }

        return {
          allowedContentTypes: allowedRfqContentTypes(metadata.kind),
          maximumSizeInBytes: maxFileBytes(metadata.kind),
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            filename: metadata.filename,
            size: metadata.size,
            contentType: metadata.contentType,
            kind: metadata.kind,
          }),
        };
      },
    });
    return sendJson(res, 200, result);
  } catch (error) {
    console.error('Website file upload authorization failed:', error.message);
    return sendJson(res, 400, { error: error.message || 'The file upload could not be authorized.' });
  }
};
