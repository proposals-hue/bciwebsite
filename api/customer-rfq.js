const { del } = require('@vercel/blob');
const { erpFetch, erpUploadFile, sendJson } = require('./_erp');
const { readPrivateBlob } = require('./_rfq-file');
const { fetchWebsiteItem } = require('./_website-item');

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function riyadhToday() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function isValidIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

async function validateItem(row) {
  const itemCode = clean(row && row.item_code, 240);
  const qty = Number(row && row.qty);
  const description = clean(row && row.description, 2000);
  if (!itemCode || !Number.isFinite(qty) || qty <= 0 || qty > 1000000000) {
    throw badRequest('Every RFQ item needs a valid product and a quantity greater than zero.');
  }

  const item = await fetchWebsiteItem(itemCode);
  return {
    item_code: item.name,
    qty,
    uom: clean(item.stock_uom, 140),
    description,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let logoBlobUrl = '';
  let crBlobUrl = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    logoBlobUrl = clean(body.logo_blob?.url, 1000);
    crBlobUrl = clean(body.cr_blob?.url, 1000);
    const contactPerson = clean(body.contact_person, 140);
    const customerName = clean(body.customer_name, 140);
    const crNumber = clean(body.cr_number, 140);
    const vatNumber = clean(body.vat_number, 140);
    const transactionDate = clean(body.transaction_date, 10) || riyadhToday();
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone_no, 40);
    const projectName = clean(body.project_name, 240);
    const deliveryLocation = clean(body.delivery_location, 500);
    const requiredDate = clean(body.required_date, 10);
    const remarks = clean(body.remarks, 5000);
    const source = clean(body.source, 300);
    const pageUrl = clean(body.page_url, 1000);
    const lang = clean(body.lang, 10);
    const rows = Array.isArray(body.items) ? body.items : [];

    if (!contactPerson || !customerName) {
      throw badRequest('Please provide the contact person and customer or company name.');
    }
    if (!email && !phone) throw badRequest('Please provide an email address or phone number.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw badRequest('Please provide a valid email address.');
    }
    if (!deliveryLocation || !crNumber || !vatNumber) {
      throw badRequest('Please provide the delivery location, CR number, and VAT number.');
    }
    if (!crBlobUrl) throw badRequest('Please attach the CR document.');
    if (!isValidIsoDate(transactionDate)) {
      throw badRequest('Please provide a valid RFQ date.');
    }
    if (requiredDate && !isValidIsoDate(requiredDate)) {
      throw badRequest('Please provide a valid required date.');
    }
    if (!rows.length || rows.length > 20) throw badRequest('Please add between 1 and 20 RFQ items.');

    const requestedCodes = rows.map((row) => clean(row && row.item_code, 240));
    if (requestedCodes.some((code) => !code)) {
      throw badRequest('Every RFQ item needs a valid product and a quantity greater than zero.');
    }
    if (new Set(requestedCodes).size !== requestedCodes.length) {
      throw badRequest('Please combine duplicate products into one RFQ item row.');
    }

    const [items, logo, crAttachment] = await Promise.all([
      Promise.all(rows.map(validateItem)),
      readPrivateBlob(body.logo_blob, 'logo'),
      readPrivateBlob(body.cr_blob, 'cr'),
    ]);

    const contextLines = [
      `Website contact person: ${contactPerson}`,
      projectName ? `Project name: ${projectName}` : '',
      deliveryLocation ? `Delivery location: ${deliveryLocation}` : '',
      requiredDate ? `Required date: ${requiredDate}` : '',
      source ? `Website source: ${source}` : '',
      lang ? `Website language: ${lang}` : '',
      pageUrl ? `Website page: ${pageUrl}` : '',
    ].filter(Boolean);
    const data = {
      customer_name: customerName,
      cr_number: crNumber,
      vat_number: vatNumber,
      transaction_date: transactionDate,
      email,
      phone_no: phone,
      items,
      remarks: [...contextLines, remarks].filter(Boolean).join('\n'),
    };

    const payload = await erpFetch('/api/resource/Customer RFQ', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const rfqId = payload.data?.name;
    if (!rfqId) throw new Error('ERP did not return the Customer RFQ ID');

    const attachmentUpdates = {};
    const attachmentWarnings = [];
    for (const [file, fieldname] of [[logo, 'company_logo'], [crAttachment, 'cr_attachment']]) {
      if (!file) continue;
      try {
        const upload = await erpUploadFile({
          ...file,
          doctype: 'Customer RFQ',
          docname: rfqId,
          fieldname,
        });
        const fileUrl = upload.message?.file_url || upload.data?.file_url || '';
        if (!fileUrl) throw new Error('ERP did not return the uploaded file URL');
        attachmentUpdates[fieldname] = fileUrl;
      } catch (error) {
        attachmentWarnings.push(fieldname);
        console.error(`Customer RFQ ${rfqId} ${fieldname} upload failed:`, error.message);
      }
    }
    if (Object.keys(attachmentUpdates).length) {
      try {
        await erpFetch(`/api/resource/Customer RFQ/${encodeURIComponent(rfqId)}`, {
          method: 'PUT',
          body: JSON.stringify(attachmentUpdates),
        });
      } catch (error) {
        attachmentWarnings.push('record_update');
        console.error(`Customer RFQ ${rfqId} attachment linking failed:`, error.message);
      }
    }

    return sendJson(res, 201, {
      ok: true,
      rfq_id: rfqId,
      attachment_warning: attachmentWarnings.length > 0,
    });
  } catch (error) {
    console.error('ERP Customer RFQ submission failed:', error.message);
    const status = error.statusCode === 400 ? 400 : (error.statusCode === 503 ? 503 : 502);
    return sendJson(res, status, {
      error: status === 400
        ? error.message
        : 'We could not register the RFQ in ERP. Please try again.',
    });
  } finally {
    for (const blobUrl of [logoBlobUrl, crBlobUrl].filter(Boolean)) {
      try { await del(blobUrl); }
      catch (error) { console.error('Temporary RFQ file cleanup failed:', error.message); }
    }
  }
};
