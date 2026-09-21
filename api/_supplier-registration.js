const { del } = require('@vercel/blob');
const { erpFetch, erpWebForm, erpUploadFile, sendJson } = require('./_erp');
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
// The offered items go two places: the `custom_supplier_items` child table
// (structured, one row per product) and, as a readable block, `supplier_details`
// — the child table has no unit or currency column, so the text keeps what the
// grid cannot hold. See docs/erp-supplier-registration.md.
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

// One offered product or service. Every column is required: the form marks all
// four fields mandatory, and this is the server-side half of that rule.
function validateItem(row, index) {
  const name = clean(row && row.name, 240);
  const unit = clean(row && row.unit, 40);
  const rawPrice = clean(row && row.price, 40);
  const currency = clean(row && row.currency, 8).toUpperCase();

  if (!name) throw badRequest(`Item ${index + 1} needs a product or service name.`);
  if (!unit) throw badRequest(`Item ${index + 1} needs a unit.`);
  if (!rawPrice) throw badRequest(`Item ${index + 1} needs a price.`);

  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0 || price > 1000000000) {
    throw badRequest(`Item ${index + 1} has an invalid price.`);
  }
  if (!CURRENCIES.includes(currency)) {
    throw badRequest(`Item ${index + 1} needs a currency for its price.`);
  }
  return { name, unit, price, currency };
}

// A `custom_supplier_items` row. The grid has exactly three columns:
//   item       Link -> Item   left empty on purpose. ERP does NOT validate Item
//                             links on child rows, so a supplier's free-text
//                             product name would be stored as a broken link.
//   item_name  Data           where the supplier's own wording belongs.
//   price      Currency       in the company's currency (SAR).
// Unit and non-SAR currency have no column, so they ride along in item_name
// rather than being silently dropped or misfiled as SAR.
function supplierItemRow(item) {
  const unit = item.unit ? ` (per ${item.unit})` : '';
  const foreign = item.price !== null && item.currency !== 'SAR';
  const note = foreign ? ` — ${item.price} ${item.currency}` : '';
  return {
    item_name: `${item.name}${unit}${note}`.slice(0, 140),
    price: foreign || item.price === null ? 0 : item.price,
  };
}

function formatItem(item, index) {
  const price = item.price === null
    ? 'price on request'
    : `${item.price} ${item.currency}${item.unit ? ` / ${item.unit}` : ''}`;
  const unitOnly = item.price === null && item.unit ? ` (per ${item.unit})` : '';
  return `${index + 1}. ${item.name}${unitOnly} — ${price}`;
}

module.exports = async function registerSupplier(body, res) {
  let logoBlobUrl = '';
  let profileBlobUrl = '';
  let catalogBlobUrl = '';
  try {
    logoBlobUrl = clean(body.logo_blob?.url, 1000);
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

    // The form marks every field mandatory; enforce the same here so the
    // endpoint cannot be used to file a half-complete registration.
    const REQUIRED = [
      [supplierName, 'your company name'],
      [supplierNameAr, 'your company name in Arabic'],
      [country, 'your country'],
      [city, 'your city'],
      [contactPerson, 'a contact person'],
      [email, 'an email address'],
      [mobile, 'a mobile number'],
      [website, 'your website'],
      [crNo, 'your CR number'],
      [taxId, 'your VAT / Tax ID'],
      // `notes` is deliberately NOT here - it is the one optional field.
    ];
    for (const [value, what] of REQUIRED) {
      if (!value) throw badRequest(`Please provide ${what}.`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw badRequest('Please provide a valid email address.');
    if (!SUPPLIER_TYPES.includes(supplierType)) throw badRequest('Please select a valid supplier type.');
    if (!CATEGORIES[categoryKey]) throw badRequest('Please select the category you supply.');
    if (!/^https?:\/\//i.test(website)) {
      throw badRequest('The website address must start with http:// or https://.');
    }
    if (!logoBlobUrl) throw badRequest('Please attach your company logo.');
    if (!profileBlobUrl) throw badRequest('Please attach your company profile.');
    if (!catalogBlobUrl) throw badRequest('Please attach your catalog or price list.');
    if (!rows.length || rows.length > MAX_ITEMS) {
      throw badRequest(`Please list between 1 and ${MAX_ITEMS} products or services.`);
    }

    const items = rows.map(validateItem);

    const [logo, profile, catalog] = await Promise.all([
      readPrivateBlob(body.logo_blob, 'supplier-logo'),
      readPrivateBlob(body.profile_blob, 'supplier-profile'),
      readPrivateBlob(body.catalog_blob, 'supplier-catalog'),
    ]);

    const details = [
      `Category: ${CATEGORIES[categoryKey]}`,
      '',
      'Offered products and services:',
      ...items.map(formatItem),
      notes ? `\nNotes:\n${notes}` : null,
      logo || profile || catalog
        ? `\nAttached: ${[logo && 'company logo', profile && 'company profile', catalog && 'catalog / price list'].filter(Boolean).join(', ')}`
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

    // Everything below runs against an already-saved registration, so a failure
    // here is logged and reported but never loses the submission.
    const attachmentWarnings = [];
    if (supplierId) {
      // The guest web form can only set its own 13 fields. The child table and
      // the Company Profile attachment are written back over the authenticated
      // REST API, which is also the only way to upload a file at all.
      const updates = { custom_supplier_items: items.map(supplierItemRow) };

      for (const [file, label, fieldname] of [
        // `image` is ERPNext's Supplier avatar - hidden from the field list
        // because it renders as the logo at the top of the form.
        [logo, 'company logo', 'image'],
        [profile, 'company profile', 'custom_company_profile'],
        [catalog, 'catalog', ''], // no dedicated field: a plain attachment
      ]) {
        if (!file) continue;
        try {
          const upload = await erpUploadFile({
            ...file,
            doctype: 'Supplier',
            docname: supplierId,
            ...(fieldname ? { fieldname } : {}),
          });
          const fileUrl = upload.message?.file_url || upload.data?.file_url || '';
          if (fieldname && fileUrl) updates[fieldname] = fileUrl;
        } catch (error) {
          attachmentWarnings.push(label);
          console.error(`Supplier ${supplierId} ${label} upload failed:`, error.message);
        }
      }

      try {
        await erpFetch(`/api/resource/Supplier/${encodeURIComponent(supplierId)}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch (error) {
        // supplier_details still carries every line in readable form, so
        // procurement loses nothing — no need to alarm the supplier.
        console.error(`Supplier ${supplierId} item/profile sync failed:`, error.message);
      }
    } else if (logo || profile || catalog) {
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
    for (const blobUrl of [logoBlobUrl, profileBlobUrl, catalogBlobUrl].filter(Boolean)) {
      try { await del(blobUrl); }
      catch (error) { console.error('Temporary supplier file cleanup failed:', error.message); }
    }
  }
};
