const { erpFetch, sendJson } = require('./_erp');

const text = (value) => String(value == null ? '' : value).trim();

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const params = new URLSearchParams({
      fields: JSON.stringify(['name']),
      limit_page_length: '500',
      order_by: 'name asc',
    });
    const payload = await erpFetch(`/api/resource/Designation?${params}`);
    const designations = [...new Set(
      (Array.isArray(payload.data) ? payload.data : [])
        .map((row) => text(row.name))
        .filter(Boolean),
    )];

    res.setHeader('Cache-Control', 'private, max-age=300');
    return sendJson(res, 200, { designations });
  } catch (error) {
    console.error('ERP designations feed failed:', error.message);
    return sendJson(res, error.statusCode === 503 ? 503 : 502, {
      error: 'The positions list is temporarily unavailable.',
    });
  }
};
