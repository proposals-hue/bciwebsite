const { erpFetch } = require('./_erp');

// Website forms may only reference finished products that are published to the
// public catalogue — the same gate /api/rfq-items uses to build the list the
// browser picks from. Anything else is rejected as an invalid selection.
async function fetchWebsiteItem(itemCode) {
  const code = String(itemCode == null ? '' : itemCode).trim().slice(0, 240);
  if (!code) {
    const error = new Error('Please choose a BCI product.');
    error.statusCode = 400;
    throw error;
  }

  let item;
  try {
    const payload = await erpFetch(`/api/resource/Item/${encodeURIComponent(code)}`);
    item = payload.data || {};
  } catch (error) {
    if (error.statusCode !== 404) throw error;
    const notFound = new Error(`The selected product “${code}” is no longer available.`);
    notFound.statusCode = 400;
    throw notFound;
  }

  if (Number(item.disabled) || !Number(item.is_sales_item)
      || item.item_group !== 'BCI-Finished Products'
      || !Number(item.custom_bci_website_sync)) {
    const unavailable = new Error(`The selected product “${code}” is not available on the website.`);
    unavailable.statusCode = 400;
    throw unavailable;
  }

  return item;
}

module.exports = { fetchWebsiteItem };
