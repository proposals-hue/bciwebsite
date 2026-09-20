const { del } = require('@vercel/blob');
const { erpWebForm, erpUploadFile, sendJson } = require('./_erp');
const { readPrivateBlob } = require('./_rfq-file');

// Supplier registration with structured offer lines and two attachments.
//
// This is a helper, not a route: it is reached through api/web-form-submit.js.
// Vercel's plan caps a deployment at 12 Serverless Functions and api/ was
// already at 12, so a 14th file here must not become a 13th function — keep the
// leading underscore.
//
// The Supplier record itself is still created through the guest ERP Web Form
// (same path the plain form used), so no ERP credential reaches the browser.
// The offered items are rendered into `supplier_details` because Supplier has
// no child table for them — see docs/erp-supplier-registration.md before
// moving them to a real ERP table.
//
// The attachments are a separate, token-authenticated step: they are uploaded
// against the created Supplier with no `fieldname`, which files them as ordinary
// document attachments and needs no custom Attach field in ERP.

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

const SUPPLIER_TYPES = ['Company', 'Individual', 'Partnership'];
const CURRENCIES = ['SAR', 'USD', 'EUR', 'AED', 'GBP', 'CNY', 'INR', 'JPY', 'TRY', 'EGP'];
// Mirrors PROCUREMENT in src/supplier-page.jsx — the value is a slug, the label
// is what procurement reads in ERP. Keep the two lists in step.
const CATEGORIES = {
  'raw-materials': 'Raw Materials & Chemicals',
  fillers: 'Fillers & Aggregates',
  packaging: 'Packaging',
  equipment: 'Equipment & Spares',
  logistics: 'Logistics & Transport',
  services: 'Services & Contracting',
  other: 'Other / multiple categories',
};
const MAX_ITEMS = 20;
const MAX_DETAILS = 5000;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// Frappe answers a validation failure with 417 and a human-readable reason in
// `_server_messages`, which `erpWebForm` has already unwrapped into
// error.message. Those say exactly what the supplier has to fix ("Value missing
// for Supplier: Supplier Name", "Could not find Country: Xyz"), so they are
// worth showing instead of a generic apology. Anything else stays generic, and
// the real cause goes to the function log.
function erpErrorResponse(error) {
  const ownValidation = error.statusCode === 400;
  const erpValidation = error.statusCode === 417 || error.statusCode === 409;
  if (ownValidation) return [400, { error: error.message }];
  if (erpValidation) {
    const message = String(error.message || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300);
    return [400, {
      error: message
        ? `ERP rejected the registration: ${message}`
        : 'ERP rejected the registration. Please check the details and try again.',
    }];
  }
  if (error.statusCode === 503) {
    return [503, { error: 'The ERP connection is not configured. Please try again later.' }];
  }
  return [502, { error: 'We could not register your company in ERP. Please try again.' }];
}

// One offered product or service. Price is optional — plenty of suppliers will
// not quote before an NDA — but a price without a currency is meaningless.
function validateItem(row, index) {
  const name = clean(row && row.name, 240);
  const unit = clean(row && row.unit, 40);
  const rawPrice = clean(row && row.price, 40);
  const currency = clean(row && row.currency, 8).toUpperCase();

  if (!name) throw badRequest(`Item ${index + 1} needs a product or service name.`);

  let price = null;
  if (rawPrice) {
    price = Number(rawPrice);
    if (!Number.isFinite(price) || price <= 0 || price > 1000000000) {
      throw badRequest(`Item ${index + 1} has an invalid price.`);
    }
    if (!CURRENCIES.includes(currency)) {
      throw badRequest(`Item ${index + 1} needs a currency for its price.`);
    }
  }
  return { name, unit, price, currency: price === null ? '' : currency };
}

function formatItem(item, index) {
  const price = item.price === null
    ? 'price on request'
    : `${item.price} ${item.currency}${item.unit ? ` / ${item.unit}` : ''}`;
  const unitOnly = item.price === null && item.unit ? ` (per ${item.unit})` : '';
  return `${index + 1}. ${item.name}${unitOnly} — ${price}`;
}

module.exports = async function registerSupplier(body, res) {
  let profileBlobUrl = '';
  let catalogBlobUrl = '';
  try {
    profileBlobUrl = clean(body.profile_blob?.url, 1000);
    catalogBlobUrl = clean(body.catalog_blob?.url, 1000);

    const supplierName = clean(body.supplier_name, 140);
    const supplierNameAr = clean(body.supplier_name_in_arabic, 140);
    const supplierType = clean(body.supplier_type, 40) || 'Company';
    const country = clean(body.country, 140);
    const city = clean(body.custom_city, 140);
    const contactPerson = clean(body.custom_contact_person, 140);
    const email = clean(body.email_id, 180).toLowerCase();
    const mobile = clean(body.mobile_no, 40);
    const website = clean(body.website, 1000);
    const crNo = clean(body.custom_cr_no, 140);
    const taxId = clean(body.tax_id, 140);
    const categoryKey = clean(body.category, 40);
    const notes = clean(body.notes, 2000);
    const pageUrl = clean(body.page_url, 1000);
    const lang = clean(body.lang, 10);
    const rows = Array.isArray(body.items) ? body.items : [];

    if (!supplierName) throw badRequest('Please provide your company name.');
    if (!email) throw badRequest('Please provide an email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw badRequest('Please provide a valid email address.');
    if (!SUPPLIER_TYPES.includes(supplierType)) throw badRequest('Please select a valid supplier type.');
    if (!CATEGORIES[categoryKey]) throw badRequest('Please select the category you supply.');
    if (website && !/^https?:\/\//i.test(website)) {
      throw badRequest('The website address must start with http:// or https://.');
    }
    if (!rows.length || rows.length > MAX_ITEMS) {
      throw badRequest(`Please list between 1 and ${MAX_ITEMS} products or services.`);
    }

    const items = rows.map(validateItem);

    const [profile, catalog] = await Promise.all([
      readPrivateBlob(body.profile_blob, 'supplier-profile'),
      readPrivateBlob(body.catalog_blob, 'supplier-catalog'),
    ]);

    const details = [
      `Category: ${CATEGORIES[categoryKey]}`,
      '',
      'Offered products and services:',
      ...items.map(formatItem),
      notes ? `\nNotes:\n${notes}` : null,
      profile || catalog
        ? `\nAttached: ${[profile && 'company profile', catalog && 'catalog / price list'].filter(Boolean).join(', ')}`
        : null,
      '\n—',
      'Submitted via the bcisaudi.com supplier registration form',
      pageUrl ? `Website page: ${pageUrl}` : null,
      lang ? `Website language: ${lang}` : null,
    ].filter((line) => line !== null).join('\n').slice(0, MAX_DETAILS);

    const payload = await erpWebForm('supplier-registration', {
      doctype: 'Supplier',
      supplier_name: supplierName,
      supplier_name_in_arabic: supplierNameAr,
      supplier_type: supplierType,
      country,
      email_id: email,
      mobile_no: mobile,
      website,
      custom_cr_no: crNo,
      tax_id: taxId,
      supplier_details: details,
      custom_city: city,
      custom_contact_person: contactPerson,
      disabled: 1,
    });
    const supplierId = payload.message?.name || payload.data?.name || '';

    // The registration is already saved; a failed attachment must not fail it.
    const attachmentWarnings = [];
    if (supplierId) {
      for (const [file, label] of [[profile, 'company profile'], [catalog, 'catalog']]) {
        if (!file) continue;
        try {
          await erpUploadFile({ ...file, doctype: 'Supplier', docname: supplierId });
        } catch (error) {
          attachmentWarnings.push(label);
          console.error(`Supplier ${supplierId} ${label} upload failed:`, error.message);
        }
      }
    } else if (profile || catalog) {
      attachmentWarnings.push('all');
      console.error('ERP did not return a Supplier name; attachments were not linked.');
    }

    return sendJson(res, 201, {
      ok: true,
      supplier_id: supplierId || null,
      attachment_warning: attachmentWarnings.length > 0,
    });
  } catch (error) {
    console.error('ERP supplier registration failed:', error.message);
    return sendJson(res, ...erpErrorResponse(error));
  } finally {
    for (const blobUrl of [profileBlobUrl, catalogBlobUrl].filter(Boolean)) {
      try { await del(blobUrl); }
      catch (error) { console.error('Temporary supplier file cleanup failed:', error.message); }
    }
  }
};
