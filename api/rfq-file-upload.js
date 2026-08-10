const { handleUpload } = require('@vercel/blob/client');
const { sendJson } = require('./_erp');
const {
  MAX_RFQ_FILE_BYTES,
  allowedRfqContentTypes,
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
        catch (_) { throw new Error('Invalid RFQ file upload request.'); }

        const metadata = validateRfqFileMetadata(details);
        const expectedPath = `customer-rfq/${metadata.kind}/${safeRfqFileName(details.name)}`;
        if (pathname !== expectedPath || !pathname.startsWith(`customer-rfq/${metadata.kind}/`)) {
          throw new Error('Invalid RFQ file upload path.');
        }

        return {
          allowedContentTypes: allowedRfqContentTypes(metadata.kind),
          maximumSizeInBytes: MAX_RFQ_FILE_BYTES,
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
    console.error('RFQ file upload authorization failed:', error.message);
    return sendJson(res, 400, { error: error.message || 'RFQ file upload could not be authorized.' });
  }
};
