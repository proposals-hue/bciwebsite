const { del } = require('@vercel/blob');
const { erpFetch, erpUploadFile, sendJson } = require('./_erp');
const { readPrivateBlob } = require('./_rfq-file');

// Customer registration: a prospective buyer opens an account from the website.
//
// This is a helper, not a route: it is reached through api/web-form-submit.js.
// Vercel's plan caps a deployment at 12 Serverless Functions and api/ is already
// at 12, so this file must keep its leading underscore.
//
// Unlike the supplier registration, this does NOT go through a guest ERP Web
// Form. ERP makes `custom_image` mandatory on Customer, and a web form cannot
// carry a file — the image has to exist and be named in the very insert that
// creates the record. So the logo is uploaded first, unattached, and its
// file_url goes into the insert. See docs/erp-customer-registration.md.
//
// Every registration is created with `disabled: 1`. A self-registered buyer can
// never be transacted against until sales reviews the record and enables it.

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

const CUSTOMER_TYPES = ['Company', 'Individual', 'Partnership'];

// ERP forces both `default_sales_partner` and at least one `sales_team` row on
// every Customer (Property Setters, not Custom Fields — they do not show up in
// a `Custom Field` query). A website registration has no salesperson yet, so it
// is parked on the dedicated "Website" Sales Partner / Sales Person created for
// exactly this, and sales reassigns it when the account is reviewed.
const WEBSITE_SALES_PARTNER = 'Website';
const WEBSITE_SALES_PERSON = 'Website';

const CUSTOMER_GROUP = 'BCI';
// Territory is a Link field and ERP holds only these. Anything else has to fall
// back to 'Rest Of The World' or the insert fails server-side.
const TERRITORIES = {
  'Saudi Arabia': 'Saudi Arabia',
  Kuwait: 'Kuwait',
  Bahrain: 'Bahrain',
  Sudan: 'Sudan',
  Yemen: 'Yeman', // ERP's own spelling — do not "fix" it, it is the record name.
};
const FALLBACK_TERRITORY = 'Rest Of The World';

// Mirrors CUSTOMER_INTERESTS in src/customer-registration-page.jsx — the value
// is a slug, the label is what sales reads in ERP. Keep the two lists in step.
const INTERESTS = {
  waterproofing: 'Waterproofing & Roofing',
  polyurea: 'Polyurea Membranes',
  'pu-foam': 'PU Foam & Insulation',
  flooring: 'Flooring Systems',
  coatings: 'Protective Coatings',
  'concrete-repair': 'Concrete Repair',
  grouts: 'Grouts & Adhesives',
  sealants: 'Sealants & Joints',
  admixtures: 'Admixtures',
};

const MAX_DETAILS = 5000;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// A message that is safe to show the visitor verbatim.
function conflict(message) {
  const error = new Error(message);
  error.statusCode = 409;
  error.expose = true;
  return error;
}

// ERP names Customers by Customer Name (Selling Settings → cust_master_name),
// but on a collision Frappe does NOT reject the insert — it silently appends a
// suffix and you get "Acme Trading - 1" as a second, separate account. So a
// customer who submits the form twice quietly ends up with two records and
// sales has no way to tell which is real. Both duplicates are therefore checked
// before the insert rather than being left to ERP.
function duplicateNameMessage(name) {
  return `An account for “${name}” is already registered. If this is your company, `
    + 'please email info@bcisaudi.com instead of registering again.';
}

// Deliberately says nothing about the other customer. ERP's own message names
// them ("CR Number 123 is already used by Customer Acme Trading") and this
// endpoint is unauthenticated, so passing that through would let anyone probe
// CR numbers and read back BCI's customer list.
const DUPLICATE_CR_MESSAGE = 'This CR number is already registered with BCI. '
  + 'Please check the number, or email info@bcisaudi.com if you think this is a mistake.';
const CR_LEAK = /CR Number .*is already used by Customer/i;

// True when some Customer already holds `value` in `field`. MySQL's default
// collation makes `=` case-insensitive, which is what we want: ERP would treat
// "ACME TRADING" and "Acme Trading" as the same name too.
async function customerExists(field, value) {
  const query = new URLSearchParams({
    filters: JSON.stringify([[field, '=', value]]),
    fields: JSON.stringify(['name']),
    limit_page_length: '1',
  });
  const found = await erpFetch(`/api/resource/Customer?${query}`);
  return Array.isArray(found.data) && found.data.length > 0;
}

// Frappe answers a validation failure with 417 and a human-readable reason in
// `_server_messages`, already unwrapped into error.message by erpFetch. Those
// say exactly what has to change ("CR Number 123 is already used by Customer
// X"), so they are worth showing. Anything else stays generic and the real
// cause goes to the function log.
function erpErrorResponse(error, customerName) {
  if (error.statusCode === 400) return [400, { error: error.message }];
  if (error.expose) return [error.statusCode, { error: error.message }];

  const raw = String(error.message || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Backstop for the two duplicates the pre-checks above normally catch — a
  // race between two submissions can still land here, and neither ERP message
  // may be shown as-is.
  if (CR_LEAK.test(raw)) return [409, { error: DUPLICATE_CR_MESSAGE }];
  if (/duplicate|already exists/i.test(raw) && /customer/i.test(raw)) {
    return [409, { error: duplicateNameMessage(customerName) }];
  }
  if (error.statusCode === 417 || error.statusCode === 409) {
    return [400, {
      error: raw
        ? `ERP rejected the registration: ${raw.slice(0, 300)}`
        : 'ERP rejected the registration. Please check the details and try again.',
    }];
  }
  if (error.statusCode === 503) {
    return [503, { error: 'The ERP connection is not configured. Please try again later.' }];
  }
  return [502, { error: 'We could not register your company in ERP. Please try again.' }];
}

// The readable block sales reads on the Customer record. Everything the website
// collects that has no dedicated ERP field ends up here rather than being
// dropped: the address, what they buy, how much, and their own notes.
function customerDetails({ interests, address, city, country, notes, pageUrl, lang, attached }) {
  return [
    interests.length ? `Interested in: ${interests.map((key) => INTERESTS[key]).join(', ')}` : null,
    '',
    'Address:',
    address,
    `${city}, ${country}`,
    notes ? `\nNotes:\n${notes}` : null,
    attached.length ? `\nAttached: ${attached.join(', ')}` : null,
    '\n—',
    'Registered via the bcisaudi.com customer registration form',
    'Created disabled — review and enable before transacting.',
    pageUrl ? `Website page: ${pageUrl}` : null,
    lang ? `Website language: ${lang}` : null,
  ].filter((line) => line !== null).join('\n').slice(0, MAX_DETAILS);
}

module.exports = async function registerCustomer(body, res) {
  const stagedUrls = [];
  let customerName = '';
  try {
    for (const key of ['logo_blob', 'cr_blob', 'vat_blob']) {
      const url = clean(body[key] && body[key].url, 1000);
      if (url) stagedUrls.push(url);
    }

    customerName = clean(body.customer_name, 140);
    const customerNameAr = clean(body.customer_name_in_arabic, 140);
    const customerType = clean(body.customer_type, 40) || 'Company';
    const country = clean(body.country, 140);
    const city = clean(body.city, 140);
    const addressLine = clean(body.address_line, 240);
    const contactPerson = clean(body.contact_person, 140);
    const email = clean(body.email_id, 180).toLowerCase();
    const mobile = clean(body.mobile_no, 40);
    const website = clean(body.website, 1000);
    const crNumber = clean(body.custom_cr_number, 140);
    const vatNumber = clean(body.custom_vat_registration_number, 140);
    const notes = clean(body.notes, 2000);
    const pageUrl = clean(body.page_url, 1000);
    const lang = clean(body.lang, 10);
    const interests = (Array.isArray(body.interests) ? body.interests : [])
      .map((key) => clean(key, 40))
      .filter((key) => INTERESTS[key]);

    // The form marks these required; enforce the same here so the endpoint
    // cannot be used to file a half-complete account.
    const REQUIRED = [
      [customerName, 'your company name'],
      [country, 'your country'],
      [city, 'your city'],
      [addressLine, 'your address'],
      [contactPerson, 'a contact person'],
      [email, 'an email address'],
      [mobile, 'a mobile number'],
      [crNumber, 'your CR number'],
      // VAT number, website, Arabic name and notes are deliberately optional —
      // a small contractor may have none of them.
    ];
    for (const [value, what] of REQUIRED) {
      if (!value) throw badRequest(`Please provide ${what}.`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw badRequest('Please provide a valid email address.');
    if (!CUSTOMER_TYPES.includes(customerType)) throw badRequest('Please select a valid account type.');
    if (website && !/^https?:\/\//i.test(website)) {
      throw badRequest('The website address must start with http:// or https://.');
    }
    if (!interests.length) throw badRequest('Please select at least one product line you are interested in.');
    if (!clean(body.logo_blob && body.logo_blob.url, 1000)) {
      throw badRequest('Please attach your company logo.');
    }
    if (!clean(body.cr_blob && body.cr_blob.url, 1000)) {
      throw badRequest('Please attach your commercial registration (CR).');
    }

    // Before anything is uploaded: Frappe would append a suffix rather than
    // reject either of these, leaving a duplicate account behind.
    const [nameTaken, crTaken] = await Promise.all([
      customerExists('customer_name', customerName),
      customerExists('custom_cr_number', crNumber),
    ]);
    if (nameTaken) throw conflict(duplicateNameMessage(customerName));
    if (crTaken) throw conflict(DUPLICATE_CR_MESSAGE);

    const [logo, crDoc, vatDoc] = await Promise.all([
      readPrivateBlob(body.logo_blob, 'customer-logo'),
      readPrivateBlob(body.cr_blob, 'customer-cr'),
      readPrivateBlob(body.vat_blob, 'customer-vat'),
    ]);
    if (!logo) throw badRequest('Your company logo could not be read. Please attach it again.');

    // ERP makes `custom_image` mandatory, so the logo must already be a File in
    // ERP before the Customer insert runs. It is uploaded unattached (Frappe
    // rejects an upload_file that names a doctype with no docname) and pointed
    // at its Customer afterwards.
    const logoUpload = await erpUploadFile({ ...logo });
    const logoUrl = logoUpload.message?.file_url || logoUpload.data?.file_url || '';
    if (!logoUrl) throw new Error('ERP did not return a file URL for the company logo');

    const attached = ['company logo', 'commercial registration (CR)'];
    if (vatDoc) attached.push('VAT certificate');

    const payload = await erpFetch('/api/resource/Customer', {
      method: 'POST',
      body: JSON.stringify({
        doctype: 'Customer',
        customer_name: customerName,
        ...(customerNameAr ? { customer_name_in_arabic: customerNameAr } : {}),
        customer_type: customerType,
        customer_group: CUSTOMER_GROUP,
        territory: TERRITORIES[country] || FALLBACK_TERRITORY,
        // Read Only in the ERP form, but settable over REST — and ERPNext uses
        // both to auto-create the Customer's primary Contact on insert.
        email_id: email,
        mobile_no: mobile,
        ...(website ? { website } : {}),
        custom_cr_number: crNumber,
        ...(vatNumber ? { custom_vat_registration_number: vatNumber, tax_id: vatNumber } : {}),
        // Mandatory Custom Field labelled "Expo Type", but every recent record
        // uses it as the customer's city (Riyadh, Dammam, Jeddah…), so that is
        // what goes in it.
        custom_type: city,
        custom_image: logoUrl,
        // A website registration is cash-only until the existing Customer Credit
        // Request workflow says otherwise.
        custom_customer_type: 'Cash',
        custom_credit_status: 'Not Requested',
        bill_type: customerType === 'Individual' ? 'B2C' : 'B2B',
        default_sales_partner: WEBSITE_SALES_PARTNER,
        default_commission_rate: 0,
        sales_team: [{
          sales_person: WEBSITE_SALES_PERSON, allocated_percentage: 100, commission_rate: '0',
        }],
        customer_details: customerDetails({
          interests, address: addressLine, city, country, notes, pageUrl, lang, attached,
        }),
        disabled: 1,
      }),
    });
    const customerId = payload.data?.name || payload.message?.name || '';

    // Everything below runs against an already-saved registration, so a failure
    // here is logged and reported but never loses the submission.
    const warnings = [];
    if (customerId) {
      // Point the logo File at its Customer. It is already named by
      // custom_image, so a failure here only costs the attachment listing.
      const logoFile = logoUpload.message?.name || '';
      if (logoFile) {
        try {
          await erpFetch(`/api/resource/File/${encodeURIComponent(logoFile)}`, {
            method: 'PUT',
            body: JSON.stringify({
              attached_to_doctype: 'Customer',
              attached_to_name: customerId,
              attached_to_field: 'custom_image',
            }),
          });
        } catch (error) {
          console.error(`Customer ${customerId} logo link failed:`, error.message);
        }
      }

      // The commercial documents have no dedicated Customer field, so they are
      // filed as ordinary document attachments for sales to open.
      for (const [file, label] of [[crDoc, 'commercial registration'], [vatDoc, 'VAT certificate']]) {
        if (!file) continue;
        try {
          await erpUploadFile({ ...file, doctype: 'Customer', docname: customerId });
        } catch (error) {
          warnings.push(label);
          console.error(`Customer ${customerId} ${label} upload failed:`, error.message);
        }
      }

      // ERPNext creates the primary Contact by itself but not the Address, and a
      // customer account with no address is half-useless to sales.
      try {
        const address = await erpFetch('/api/resource/Address', {
          method: 'POST',
          body: JSON.stringify({
            doctype: 'Address',
            address_title: customerId.slice(0, 100),
            address_type: 'Billing',
            address_line1: addressLine,
            city,
            country,
            email_id: email,
            phone: mobile,
            is_primary_address: 1,
            is_shipping_address: 1,
            links: [{ link_doctype: 'Customer', link_name: customerId }],
          }),
        });
        const addressId = address.data?.name || '';
        if (addressId) {
          await erpFetch(`/api/resource/Customer/${encodeURIComponent(customerId)}`, {
            method: 'PUT',
            body: JSON.stringify({ customer_primary_address: addressId }),
          });
        }
      } catch (error) {
        // customer_details still carries the address in readable form, so
        // nothing is actually lost — no need to alarm the customer.
        console.error(`Customer ${customerId} address creation failed:`, error.message);
      }
    } else if (crDoc || vatDoc) {
      warnings.push('all');
      console.error('ERP did not return a Customer name; attachments were not linked.');
    }

    return sendJson(res, 201, {
      ok: true,
      customer_id: customerId || null,
      attachment_warning: warnings.length > 0,
    });
  } catch (error) {
    console.error('ERP customer registration failed:', error.message);
    return sendJson(res, ...erpErrorResponse(error, customerName));
  } finally {
    for (const blobUrl of stagedUrls.filter(Boolean)) {
      try { await del(blobUrl); }
      catch (error) { console.error('Temporary customer file cleanup failed:', error.message); }
    }
  }
};
