const { erpFetch, sendJson } = require('./_erp');

const text = (value, max = 240) => String(value == null ? '' : value).trim().slice(0, max);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const params = new URLSearchParams({
      fields: JSON.stringify([
        'name',
        'item_name',
        'stock_uom',
        'custom_bci_website_category',
      ]),
      filters: JSON.stringify([
        ['disabled', '=', 0],
        ['is_sales_item', '=', 1],
        ['item_group', '=', 'BCI-Finished Products'],
        ['custom_bci_website_sync', '=', 1],
      ]),
      limit_page_length: '1000',
      order_by: 'custom_bci_website_category asc, item_name asc',
    });
    const payload = await erpFetch(`/api/resource/Item?${params}`);
    const items = (Array.isArray(payload.data) ? payload.data : [])
      .map((item) => ({
        code: text(item.name),
        name: text(item.item_name) || text(item.name),
        uom: text(item.stock_uom, 140),
        category: text(item.custom_bci_website_category, 180),
      }))
      .filter((item) => item.code && item.name);

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return sendJson(res, 200, { items, updated_at: new Date().toISOString() });
  } catch (error) {
    console.error('ERP RFQ item feed failed:', error.message);
    return sendJson(res, error.statusCode === 503 ? 503 : 502, {
      error: 'The RFQ product list is temporarily unavailable.',
    });
  }
};
