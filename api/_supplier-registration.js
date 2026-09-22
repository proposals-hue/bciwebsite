const { del } = require('@vercel/blob');
const { erpFetch, erpWebForm, erpUploadFile, sendJson } = require('./_erp');
const { readPrivateBlob } = require('./_rfq-file');

// Supplier registration: structured offer lines, three company documents and a
// technical data sheet per offered item.
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
// document attachments. The logo, the company profile and each item's datasheet
// are then pointed at from `image`, `custom_company_profile` and the row's
// `tds_attachment` respectively.

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

const SUPPLIER_TYPES = ['Company', 'Individual', 'Partnership'];
const CURRENCIES = ['SAR', 'USD', 'EUR', 'AED', 'GBP', 'CNY', 'INR', 'JPY', 'TRY', 'EGP'];
// Mirrors SUPPLIER_CATEGORIES in src/supplier-page.jsx — the value is a slug,
// the label is what procurement reads in ERP. Keep the two lists in step.
const CATEGORIES = {
  'raw-materials': {
    label: 'Raw Materials',
    items: {
      'polyol': 'Polyol',
      'mdi-isocyanates': 'MDI / Isocyanates',
      'polyether-polyester-polyols': 'Polyether / Polyester Polyols',
      'resins': 'Resins',
      'epoxy-raw': 'Epoxy Raw Materials',
      'polyurea-raw': 'Polyurea Raw Materials',
      'acrylic-emulsions': 'Acrylic / Polymer Emulsions',
      'catalysts-additives': 'Catalysts & Additives',
      'plasticizers': 'Plasticizers',
      'solvents': 'Solvents',
      'bitumen': 'Bitumen & Bituminous Materials',
      'sbs-app': 'SBS / APP',
      'calcium-carbonate': 'Calcium Carbonate',
      'silica': 'Silica / Silica Flour',
      'pigments-colorants': 'Pigments & Colorants',
      'fibers': 'Fibers',
      'specialty-chemicals': 'Specialty Chemicals',
      'other-raw-materials': 'Other Raw Materials',
    },
  },
  'waterproofing-roofing': {
    label: 'Waterproofing & Roofing Materials',
    items: {
      'bituminous-waterproofing': 'Bituminous Waterproofing',
      'damp-proofing': 'Damp Proofing',
      'waterproofing-membranes': 'Waterproofing Membranes',
      'liquid-waterproofing': 'Liquid Waterproofing',
      'cementitious-waterproofing': 'Cementitious Waterproofing',
      'roof-coatings': 'Roof Coatings',
      'roofing-materials': 'Roofing Materials',
      'waterproofing-accessories': 'Waterproofing Accessories',
    },
  },
  'packaging': { label: 'Packaging Materials', items: {} },
  'production-consumables': { label: 'Production Materials & Consumables', items: {} },
  'insulation': { label: 'Insulation Materials', items: {} },
  'flooring': { label: 'Flooring Materials', items: {} },
  'protective-coatings': { label: 'Protective & Industrial Coatings', items: {} },
  'construction-chemicals': { label: 'Construction Chemicals & Concrete Repair', items: {} },
  'sealants-adhesives': { label: 'Sealants & Adhesives', items: {} },
  'machinery-equipment': { label: 'Machinery & Equipment', items: {} },
  'spare-parts': { label: 'Spare Parts & Maintenance', items: {} },
  'electrical': { label: 'Electrical Materials & Equipment', items: {} },
  'mechanical': { label: 'Mechanical Materials & Equipment', items: {} },
  'laboratory': { label: 'Laboratory Equipment & Chemicals', items: {} },
  'safety-ppe': { label: 'Safety & PPE', items: {} },
  'it-office': { label: 'IT & Office Supplies', items: {} },
  'vehicles-transport': { label: 'Vehicles & Transportation', items: {} },
  'logistics-freight': { label: 'Logistics & Freight Services', items: {} },
  'maintenance-services': { label: 'Maintenance & Technical Services', items: {} },
  'construction-services': { label: 'Construction & Contracting Services', items: {} },
  'general-supplies': { label: 'General Supplies', items: {} },
};

// Slugs the previous six-category form used. A browser holding a cached copy of
// that page still posts one of these, so they are translated rather than
// rejected.
const LEGACY_CATEGORIES = {
  'raw-materials': 'raw-materials',
  fillers: 'raw-materials',
  packaging: 'packaging',
  equipment: 'machinery-equipment',
  logistics: 'logistics-freight',
  services: 'maintenance-services',
  other: 'general-supplies',
};
const MAX_CATEGORIES = 21;
const MAX_CATEGORY_ITEMS = 120;
// A freight forwarder or a maintenance contractor has no technical data sheet,
// so these are the only categories where the per-item TDS is optional. Mirrored
// by SUPPLIER_SERVICE_CATEGORIES in src/supplier-page.jsx.
const SERVICE_CATEGORIES = [
  'logistics-freight', 'maintenance-services', 'construction-services',
];
const MAX_ITEMS = 20;
const MAX_DETAILS = 5000;
// TDS uploads run sequentially against ERP inside one invocation, so they go up
// in small parallel batches instead of one at a time.
const TDS_UPLOAD_BATCH = 4;

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
// four fields mandatory, and this is the server-side half of that rule. The
// technical data sheet is required too, except for the service categories.
function validateItem(row, index, tdsRequired) {
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

  const tdsBlob = row && row.tds_blob && clean(row.tds_blob.url, 1000) ? row.tds_blob : null;
  if (tdsRequired && !tdsBlob) {
    throw badRequest(`Item ${index + 1} needs a technical data sheet (TDS).`);
  }
  return { name, unit, price, currency, tdsBlob };
}

// A `custom_supplier_items` row. The grid has exactly three columns:
//   item       Link -> Item   left empty on purpose. ERP does NOT validate Item
//                             links on child rows, so a supplier's free-text
//                             product name would be stored as a broken link.
//   item_name  Data           where the supplier's own wording belongs.
//   price      Currency       in the company's currency (SAR).
// Unit and non-SAR currency have no column, so they ride along in item_name
// rather than being silently dropped or misfiled as SAR.
//   tds_attachment  Attach  the datasheet for this line, uploaded separately and
//                           filled in afterwards (see attachItemDataSheets).
function supplierItemRow(item) {
  const unit = item.unit ? ` (per ${item.unit})` : '';
  const foreign = item.price !== null && item.currency !== 'SAR';
  const note = foreign ? ` — ${item.price} ${item.currency}` : '';
  return {
    item_name: `${item.name}${unit}${note}`.slice(0, 140),
    price: foreign || item.price === null ? 0 : item.price,
  };
}

// Pulls each item's datasheet out of Blob and into ERP, returning the file URL
// per item index so it can be written onto that item's child row. Uploaded in
// small parallel batches: a registration can carry 20 of these and they all
// share one function invocation. A datasheet that fails to upload is reported
// but never loses the registration, which is already saved by this point.
async function attachItemDataSheets(items, supplierId, onFailure) {
  const urls = new Array(items.length).fill('');
  const pending = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.tdsBlob);

  for (let start = 0; start < pending.length; start += TDS_UPLOAD_BATCH) {
    const batch = pending.slice(start, start + TDS_UPLOAD_BATCH);
    await Promise.all(batch.map(async ({ item, index }) => {
      try {
        const file = await readPrivateBlob(item.tdsBlob, 'supplier-tds');
        if (!file) return;
        const upload = await erpUploadFile({
          ...file,
          doctype: 'Supplier',
          docname: supplierId,
          // No `fieldname`: the target is a child row, which Frappe cannot set
          // from an upload. It is filed as a document attachment here and the
          // row's tds_attachment is pointed at it in the PUT below.
        });
        urls[index] = upload.message?.file_url || upload.data?.file_url || '';
      } catch (error) {
        onFailure(`TDS for item ${index + 1}`);
        console.error(`Supplier ${supplierId} TDS upload failed for item ${index + 1}:`, error.message);
      }
    }));
  }
  return urls;
}

// The supplier ticks categories and, under them, sub-items. Returns the picks
// resolved to their English labels, or throws if anything is not in the sheet.
// A cached copy of the previous page posts a single legacy slug instead, which
// is translated rather than rejected.
function validateCategories(body) {
  const rawKeys = Array.isArray(body.categories) ? body.categories : [];
  const rawItems = Array.isArray(body.category_items) ? body.category_items : [];

  const keys = [];
  for (const value of rawKeys.slice(0, MAX_CATEGORIES)) {
    const key = clean(value, 60);
    if (!CATEGORIES[key]) throw badRequest('Please select a supplier category from the list.');
    if (!keys.includes(key)) keys.push(key);
  }

  if (!keys.length) {
    const legacy = LEGACY_CATEGORIES[clean(body.category, 40)];
    if (legacy) keys.push(legacy);
  }
  if (!keys.length) throw badRequest('Please select at least one supplier category.');

  const chosen = new Map(keys.map((key) => [key, []]));
  for (const value of rawItems.slice(0, MAX_CATEGORY_ITEMS)) {
    const [key, item] = clean(value, 120).split('/');
    const label = CATEGORIES[key] && CATEGORIES[key].items[item];
    // A sub-item without its category is a malformed payload, not a choice.
    if (!label || !chosen.has(key)) {
      throw badRequest('Please select a supplier category from the list.');
    }
    if (!chosen.get(key).includes(label)) chosen.get(key).push(label);
  }
  return { keys, chosen };
}

// One line per category, with its sub-items after a colon when there are any.
function formatCategories(chosen) {
  return [...chosen.entries()].map(([key, items]) => {
    const label = CATEGORIES[key].label;
    return items.length ? `- ${label}: ${items.join(', ')}` : `- ${label}`;
  });
}

function formatItem(item, index) {
  const price = item.price === null
    ? 'price on request'
    : `${item.price} ${item.currency}${item.unit ? ` / ${item.unit}` : ''}`;
  const unitOnly = item.price === null && item.unit ? ` (per ${item.unit})` : '';
  const tds = item.tdsBlob ? ' [TDS attached]' : '';
  return `${index + 1}. ${item.name}${unitOnly} — ${price}${tds}`;
}

module.exports = async function registerSupplier(body, res) {
  let logoBlobUrl = '';
  let profileBlobUrl = '';
  let catalogBlobUrl = '';
  // Collected before any validation runs, so a rejected registration still
  // cleans up every file the browser staged for it.
  const tdsBlobUrls = [];
  try {
    logoBlobUrl = clean(body.logo_blob?.url, 1000);
    profileBlobUrl = clean(body.profile_blob?.url, 1000);
    catalogBlobUrl = clean(body.catalog_blob?.url, 1000);
    for (const row of Array.isArray(body.items) ? body.items : []) {
      const url = clean(row && row.tds_blob && row.tds_blob.url, 1000);
      if (url) tdsBlobUrls.push(url);
    }

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
    const { keys: categoryKeys, chosen: categoryPicks } = validateCategories(body);
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
    if (!/^https?:\/\//i.test(website)) {
      throw badRequest('The website address must start with http:// or https://.');
    }
    if (!logoBlobUrl) throw badRequest('Please attach your company logo.');
    if (!profileBlobUrl) throw badRequest('Please attach your company profile.');
    if (!catalogBlobUrl) throw badRequest('Please attach your catalog or price list.');
    if (!rows.length || rows.length > MAX_ITEMS) {
      throw badRequest(`Please list between 1 and ${MAX_ITEMS} products or services.`);
    }

    // Waived only when every category the supplier picked is a service one.
    const tdsRequired = categoryKeys.some((key) => !SERVICE_CATEGORIES.includes(key));
    const items = rows.map((row, index) => validateItem(row, index, tdsRequired));

    const [logo, profile, catalog] = await Promise.all([
      readPrivateBlob(body.logo_blob, 'supplier-logo'),
      readPrivateBlob(body.profile_blob, 'supplier-profile'),
      readPrivateBlob(body.catalog_blob, 'supplier-catalog'),
    ]);

    const details = [
      'Supplier categories:',
      ...formatCategories(categoryPicks),
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
      const rowsForErp = items.map(supplierItemRow);
      const updates = { custom_supplier_items: rowsForErp };

      // Datasheets first: their file URLs have to be in hand before the child
      // rows are written, since tds_attachment lives on the row itself.
      const tdsUrls = await attachItemDataSheets(
        items, supplierId, (label) => attachmentWarnings.push(label),
      );
      tdsUrls.forEach((url, index) => {
        if (url) rowsForErp[index].tds_attachment = url;
      });

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
    const staged = [logoBlobUrl, profileBlobUrl, catalogBlobUrl, ...tdsBlobUrls];
    for (const blobUrl of staged.filter(Boolean)) {
      try { await del(blobUrl); }
      catch (error) { console.error('Temporary supplier file cleanup failed:', error.message); }
    }
  }
};
