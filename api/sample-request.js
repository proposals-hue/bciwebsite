const { erpFetch, sendJson } = require('./_erp');
const { addDays, isValidIsoDate, riyadhToday } = require('./_dates');
const { fetchWebsiteItem } = require('./_website-item');

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

// How far out the ERP "expected delivery date" is set when the visitor does not
// name a date. The field is mandatory on the doctype, so it always needs a value.
const DEFAULT_DELIVERY_DAYS = 14;
const MAX_ROWS = 10;
const MAX_SAMPLE_QTY = 100;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// `description` is a Text Editor field, so plain newlines would collapse in the
// ERP desk view — each line is emitted as its own escaped paragraph instead.
function richText(lines) {
  return lines.filter(Boolean)
    .map((line) => `<p>${escapeHtml(line).replace(/\r?\n/g, '<br>')}</p>`)
    .join('');
}

async function validateRow(row) {
  const itemCode = clean(row && row.item_code, 240);
  const qty = Number(row && row.qty);
  if (!itemCode || !Number.isFinite(qty) || qty <= 0 || qty > MAX_SAMPLE_QTY) {
    throw badRequest(`Every sample needs a product and a quantity between 1 and ${MAX_SAMPLE_QTY}.`);
  }

  const item = await fetchWebsiteItem(itemCode);
  return {
    item: item.name,
    item_name: clean(item.item_name, 240) || item.name,
    quantity: qty,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const contactPerson = clean(body.contact_person, 140);
    const companyName = clean(body.company_name, 140);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone_no, 40);
    const projectName = clean(body.project_name, 240);
    const deliveryLocation = clean(body.delivery_location, 240);
    const requiredDate = clean(body.required_date, 10);
    const application = clean(body.application, 2000);
    const otherDetails = clean(body.other_details, 5000);
    const source = clean(body.source, 300);
    const pageUrl = clean(body.page_url, 1000);
    const lang = clean(body.lang, 10);
    const rows = Array.isArray(body.items) ? body.items : [];

    if (!contactPerson || !companyName) {
      throw badRequest('Please provide the contact person and company name.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw badRequest('Please provide a valid email address so we can confirm the sample.');
    }
    if (!phone) throw badRequest('Please provide a phone number — samples are delivered by hand.');
    if (!deliveryLocation) throw badRequest('Please provide the delivery location for the samples.');

    const requestDate = riyadhToday();
    if (requiredDate && !isValidIsoDate(requiredDate)) {
      throw badRequest('Please provide a valid date for when you need the samples.');
    }
    if (requiredDate && requiredDate < requestDate) {
      throw badRequest('The date you need the samples by cannot be in the past.');
    }

    if (!rows.length || rows.length > MAX_ROWS) {
      throw badRequest(`Please request between 1 and ${MAX_ROWS} sample products.`);
    }
    const requestedCodes = rows.map((row) => clean(row && row.item_code, 240));
    if (requestedCodes.some((code) => !code)) {
      throw badRequest('Every sample needs a product selected from the list.');
    }
    if (new Set(requestedCodes).size !== requestedCodes.length) {
      throw badRequest('Please combine duplicate products into one sample row.');
    }

    const items = await Promise.all(rows.map(validateRow));

    // The doctype links to a Customer and a Contact, which a website visitor has
    // neither of. Those links stay empty and the requester's own details go into
    // the plain-text fields beside them, so nothing is lost before sales decides
    // whether to create a Customer record.
    const contactLines = [
      `Requested by: ${contactPerson}`,
      `Company: ${companyName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      'Source: website sample request',
    ];
    const descriptionLines = [
      projectName ? `Project: ${projectName}` : '',
      `Delivery location: ${deliveryLocation}`,
      requiredDate ? `Needed by: ${requiredDate}` : '',
      application ? `Application: ${application}` : '',
      otherDetails ? `Other details: ${otherDetails}` : '',
      source ? `Website source: ${source}` : '',
      lang ? `Website language: ${lang}` : '',
      pageUrl ? `Website page: ${pageUrl}` : '',
    ];

    const payload = await erpFetch('/api/resource/Sample Request', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: companyName,
        email,
        phone,
        customer_details: contactLines.join('\n'),
        location: deliveryLocation,
        request_date: requestDate,
        expected_delivery_date: requiredDate || addDays(requestDate, DEFAULT_DELIVERY_DAYS),
        items,
        description: richText(descriptionLines),
      }),
    });
    const requestId = payload.data?.name;
    if (!requestId) throw new Error('ERP did not return the Sample Request ID');

    return sendJson(res, 201, { ok: true, request_id: requestId });
  } catch (error) {
    console.error('ERP Sample Request submission failed:', error.message);
    const status = error.statusCode === 400 ? 400 : (error.statusCode === 503 ? 503 : 502);
    return sendJson(res, status, {
      error: status === 400
        ? error.message
        : 'We could not register the sample request in ERP. Please try again.',
    });
  }
};
