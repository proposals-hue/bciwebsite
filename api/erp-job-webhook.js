const crypto = require('crypto');
const { sendJson } = require('./_erp');

function safeEqual(actual, expected) {
  const left = Buffer.from(String(actual || ''), 'utf8');
  const right = Buffer.from(String(expected || ''), 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const secret = String(process.env.ERP_WEBHOOK_SECRET || '');
  const authorization = String(req.headers?.authorization || '');
  if (!secret || !safeEqual(authorization, `Bearer ${secret}`)) {
    return sendJson(res, 401, { error: 'Invalid webhook signature' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (body.doctype && body.doctype !== 'Request For Job Applicant') {
    return sendJson(res, 400, { error: 'Unexpected doctype' });
  }

  // /api/jobs is deliberately no-store, so no cache purge or rebuild is
  // needed. Acknowledging this authenticated event completes the ERP delivery;
  // the next website request reads the changed ERP records immediately.
  console.log('ERP careers webhook accepted', {
    event: String(body.event || ''),
    name: String(body.name || ''),
    modified: String(body.modified || ''),
  });
  res.setHeader('Cache-Control', 'no-store');
  return sendJson(res, 202, { ok: true });
};
