const { erpFetch, erpUploadFile, sendJson } = require('./_erp');
const { fetchWebsiteItem } = require('./_website-item');
const { safeRfqFileName, validateRfqFileContents } = require('./_rfq-file');

// Customer Care & Support: a complaint, technical question, order/delivery
// problem or piece of feedback from the /support page.
//
// This is a helper, not a route: it is reached through api/web-form-submit.js,
// because Vercel's plan caps a deployment at 12 Serverless Functions.
//
// Every request becomes a "Feedback and Improvement Request" in ERP — the
// custom Quality Management doctype BCI already uses for complaints and
// feedback. It brings the whole internal workflow with it: the
// "Feedback and Improvement Lifecycle" workflow (New → Under Review → … →
// Resolved → Closed), a status-history table, SLA due dates by priority, and
// routing to a department through "Feedback Assignment Rule" records keyed by
// feedback category. The ERP name (FB-2026-00001) is the customer's ticket
// reference. See docs/erp-support-requests.md.

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

const COMPANY = 'Building Chemistry Industry';
const DOCTYPE = 'Feedback and Improvement Request';

// Created by erp_customizations/support_requests/setup_support_requests.py.
// When it exists and is enabled, ERP emails the customer on insert, and the
// page may say so. Keep the name in step with that script.
const ACK_NOTIFICATION = 'Website Support Request - Customer Acknowledgement';

// What each website topic files as in ERP. `category` is a Feedback Category
// record — the key the Feedback Assignment Rules route on — so it must name
// one that exists. Mirrors SUPPORT_CATEGORIES in src/support-page.jsx: the
// page sends the topic key, never the ERP values.
//
// request_type deliberately avoids the doctype's "General " option: it has a
// trailing space and Frappe strips the value before checking it, so it can
// never be saved.
const TOPICS = {
  complaint: {
    'product-quality': { requestType: 'Complaint', category: 'Product Quality', priority: 'High', label: 'Product quality or performance' },
    packaging: { requestType: 'Complaint', category: 'Product Quality', priority: 'Medium', label: 'Packaging or labelling' },
    'wrong-material': { requestType: 'Complaint', category: 'Delivery / Logistics', priority: 'High', label: 'Incorrect material supplied' },
    service: { requestType: 'Complaint', category: 'Customer Service', priority: 'Medium', label: 'Service or staff' },
    other: { requestType: 'Complaint', category: 'Customer Service', priority: 'Medium', label: 'Other concern' },
  },
  technical: {
    application: { requestType: 'Incident / Problem', category: 'Technical Support', priority: 'Medium', label: 'Application guidance' },
    mixing: { requestType: 'Incident / Problem', category: 'Technical Support', priority: 'Medium', label: 'Mixing ratio, coverage or curing' },
    documents: { requestType: 'Incident / Problem', category: 'Technical Support', priority: 'Low', label: 'Technical documentation' },
    compatibility: { requestType: 'Incident / Problem', category: 'Technical Support', priority: 'Medium', label: 'Compatibility or system selection' },
    'site-problem': { requestType: 'Incident / Problem', category: 'Technical Support', priority: 'High', label: 'Problem on site' },
  },
  order: {
    delay: { requestType: 'Complaint', category: 'Delivery / Logistics', priority: 'High', label: 'Delivery delay' },
    quantity: { requestType: 'Complaint', category: 'Delivery / Logistics', priority: 'Medium', label: 'Incorrect quantity' },
    damaged: { requestType: 'Complaint', category: 'Delivery / Logistics', priority: 'Medium', label: 'Damaged packaging or goods' },
    missing: { requestType: 'Complaint', category: 'Delivery / Logistics', priority: 'Medium', label: 'Missing items' },
    discrepancy: { requestType: 'Complaint', category: 'Sales', priority: 'Medium', label: 'Order discrepancy' },
    billing: { requestType: 'Complaint', category: 'Finance', priority: 'Medium', label: 'Invoice or billing issue' },
  },
  feedback: {
    suggestion: { requestType: 'Improvement Suggestion', category: 'Customer Service', priority: 'Low', label: 'Suggestion or improvement' },
    product: { requestType: 'Product Feedback', category: 'Customer Service', priority: 'Low', label: 'Product feedback' },
    service: { requestType: 'Service Feedback', category: 'Customer Service', priority: 'Low', label: 'Service feedback' },
    compliment: { requestType: 'Service Feedback', category: 'Customer Service', priority: 'Low', label: 'Compliment' },
  },
};

const CATEGORY_LABELS = {
  complaint: 'Complaint',
  technical: 'Technical Support',
  order: 'Order & Delivery',
  feedback: 'Feedback & Suggestions',
};

// Attachments travel base64-encoded inside the request, not through Vercel
// Blob: the Blob store was suspended on 2026-10-19 and every staged upload
// fails. The page shrinks photos first; this total keeps the JSON body under
// Vercel's 4.5 MB request limit.
const MB = 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_TOTAL = 3.2 * MB;
const ATTACHMENT_TYPES = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const MIN_DESCRIPTION = 20;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

const escapeHtml = (value) => String(value == null ? '' : value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function isPastOrToday(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== isoDate) return false;
  // A day of slack: the visitor's "today" can be ahead of UTC.
  return date.getTime() <= Date.now() + 24 * 60 * 60 * 1000 && isoDate >= '2000-01-01';
}

function readAttachments(list) {
  if (list == null) return [];
  if (!Array.isArray(list)) throw badRequest('The attachments could not be read. Please attach them again.');
  if (list.length > MAX_ATTACHMENTS) throw badRequest(`Please attach no more than ${MAX_ATTACHMENTS} files.`);

  let total = 0;
  return list.map((file) => {
    const filename = safeRfqFileName(file && file.name);
    const dot = filename.lastIndexOf('.');
    const extension = dot > 0 ? filename.slice(dot).toLowerCase() : '';
    const contentType = ATTACHMENT_TYPES[extension];
    if (!filename || !contentType) {
      throw badRequest(`“${filename || 'Attachment'}” is not a supported file. Please attach photos (JPG, PNG, WebP) or PDF documents.`);
    }
    const buffer = Buffer.from(typeof file.data === 'string' ? file.data : '', 'base64');
    if (!buffer.length) throw badRequest(`“${filename}” is empty. Please attach it again.`);
    total += buffer.length;
    if (total > MAX_ATTACHMENT_TOTAL) {
      throw badRequest('The attachments are too large to send together. Please remove one, or email it to info@bcisaudi.com with your ticket reference.');
    }
    try {
      validateRfqFileContents(buffer, extension);
    } catch (_) {
      throw badRequest(`“${filename}” does not look like a valid ${extension.slice(1).toUpperCase()} file. Please check it opens on your device.`);
    }
    return { buffer, filename, contentType };
  });
}

// A batch the customer typed is linked only when ERP holds it — Batch is a Link
// field, so an unknown value would fail the whole insert — and, when a product
// was chosen, only when the batch belongs to it. The typed value is kept in the
// description either way.
async function matchBatch(batch, itemCode) {
  if (!batch) return '';
  try {
    const payload = await erpFetch(`/api/resource/Batch/${encodeURIComponent(batch)}`);
    const found = payload.data || {};
    if (!found.name) return '';
    if (itemCode && found.item && found.item !== itemCode) return '';
    return found.name;
  } catch (error) {
    if (error.statusCode !== 404) console.error('Support request batch lookup failed:', error.message);
    return '';
  }
}

async function acknowledgementEnabled() {
  try {
    const payload = await erpFetch(`/api/resource/Notification/${encodeURIComponent(ACK_NOTIFICATION)}`);
    return Boolean(Number(payload.data && payload.data.enabled));
  } catch (error) {
    if (error.statusCode !== 404) console.error('Support acknowledgement check failed:', error.message);
    return false;
  }
}

// The readable record staff open in ERP. Everything the form collects is here,
// so nothing is lost before the website Custom Fields exist (ERP silently drops
// keys it has no column for).
function describe(input) {
  const row = (label, value) => (value ? `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}<br>` : '');
  const text = escapeHtml(input.description).replace(/\r?\n/g, '<br>');
  return [
    `<p><strong>Website support request — ${escapeHtml(CATEGORY_LABELS[input.category])} · ${escapeHtml(input.topic.label)}</strong></p>`,
    '<p>',
    row('Name', input.name),
    row('Company', input.company),
    row('Email', input.email),
    row('Mobile', input.phone),
    '</p><p>',
    row('Product', input.productName),
    row('Batch / lot no.', input.batch),
    row('Invoice / PO no.', input.invoice),
    row('Project', input.project),
    row('Location', input.location),
    row(input.category === 'order' ? 'Delivery date' : 'Purchase / delivery date', input.date),
    row('Attachments', input.attachmentNames.join(', ')),
    '</p>',
    '<p><strong>Customer’s description</strong></p>',
    `<p>${text}</p>`,
    '<p>—<br>',
    'Submitted through the bcisaudi.com Customer Care page.<br>',
    row('Website language', input.lang),
    row('Website page', input.pageUrl),
    '</p>',
  ].join('').replace(/<p><\/p>/g, '');
}

// Our own validation errors are shown verbatim. Frappe answers a validation
// failure with 417 and a readable reason, which is passed on; anything else
// stays generic and the real cause goes to the function log.
function errorResponse(error) {
  if (error.statusCode === 400) return [400, { error: error.message }];
  const raw = String(error.message || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (error.statusCode === 417 || error.statusCode === 409) {
    return [400, {
      error: raw
        ? `Our system could not log the request: ${raw.slice(0, 300)}`
        : 'Our system could not log the request. Please check the details and try again.',
    }];
  }
  if (error.statusCode === 503) {
    return [503, { error: 'The support system is not connected right now. Please call +966 59 312 0221 or email info@bcisaudi.com.' }];
  }
  return [502, { error: 'We could not log your request. Please try again, or call +966 59 312 0221 / email info@bcisaudi.com.' }];
}

module.exports = async function submitSupportRequest(body, res) {
  try {
    const category = clean(body.category, 40);
    const topics = TOPICS[category];
    if (!topics) throw badRequest('Please choose what your request is about.');
    const topic = topics[clean(body.topic, 40)];
    if (!topic) throw badRequest('Please choose the type of issue.');

    const name = clean(body.full_name, 140);
    const company = clean(body.company_name, 140);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.mobile, 40);
    const subjectInput = clean(body.subject, 140);
    const description = clean(body.description, 5000);
    const productCode = clean(body.product_code, 240);
    const productOther = clean(body.product_other, 140);
    const batch = clean(body.batch_no, 140);
    const invoice = clean(body.invoice_no, 140);
    const project = clean(body.project_name, 140);
    const location = clean(body.project_location, 140);
    const date = clean(body.incident_date, 10);
    const lang = clean(body.lang, 10);
    const pageUrl = clean(body.page_url, 1000);

    // The page enforces the same rules; repeat them so the endpoint cannot be
    // used to file a request nobody can act on.
    if (!name) throw badRequest('Please enter your full name.');
    if (!email && !phone) throw badRequest('Please give an email address or a mobile number so we can reach you.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw badRequest('Please enter a valid email address.');
    if (phone && (phone.replace(/\D/g, '').length < 7 || !/^[+\d\s()\-.]+$/.test(phone))) {
      throw badRequest('Please enter a valid mobile number.');
    }
    if (description.length < MIN_DESCRIPTION) {
      throw badRequest(`Please describe the issue in a little more detail (at least ${MIN_DESCRIPTION} characters).`);
    }
    if (category === 'complaint' && !productCode && !productOther) {
      throw badRequest('Please tell us which product the complaint is about.');
    }
    if (category === 'order' && !invoice) {
      throw badRequest('Please enter your invoice, delivery note or purchase order number.');
    }
    if (date && !isPastOrToday(date)) throw badRequest('Please enter a valid date that is not in the future.');

    const attachments = readAttachments(body.attachments);

    // A product picked from the catalogue is linked only if ERP still publishes
    // it to the website (the same gate as every other form); otherwise its name
    // is kept as text rather than refusing the complaint over catalogue drift.
    let itemCode = '';
    let productName = productOther;
    const [ackEnabled, item] = await Promise.all([
      acknowledgementEnabled(),
      productCode
        ? fetchWebsiteItem(productCode).catch((error) => {
          if (error.statusCode !== 400) throw error;
          console.error('Support request product not linked:', error.message);
          return null;
        })
        : null,
    ]);
    if (productCode) {
      itemCode = item ? clean(item.name, 240) : '';
      productName = clean((item && item.item_name) || productCode, 140);
    }
    const batchNo = await matchBatch(batch, itemCode);

    // The first file becomes the record's Primary Attachment, which has to be
    // named in the insert itself (an update afterwards would run the workflow's
    // edit rules). So it is uploaded unattached first and linked once the
    // record exists. A failed upload costs the attachment, not the request.
    const warnings = [];
    let primary = null;
    if (attachments.length) {
      try {
        const upload = await erpUploadFile({ ...attachments[0] });
        const fileUrl = upload.message?.file_url || '';
        if (fileUrl) primary = { url: fileUrl, file: upload.message?.name || '' };
        else warnings.push(attachments[0].filename);
      } catch (error) {
        warnings.push(attachments[0].filename);
        console.error('Support request primary attachment upload failed:', error.message);
      }
    }

    const subject = subjectInput || clean(`${topic.label}${productName ? ` — ${productName}` : ''}`, 140);
    const payload = await erpFetch(`/api/resource/${encodeURIComponent(DOCTYPE)}`, {
      method: 'POST',
      body: JSON.stringify({
        doctype: DOCTYPE,
        company: COMPANY,
        user_type: 'Customer',
        contact_me: 1,
        request_type: topic.requestType,
        feedback_category: topic.category,
        priority: topic.priority,
        subject,
        description: describe({
          category, topic, name, company, email, phone, productName, batch, invoice, project,
          location, date, description, lang, pageUrl,
          attachmentNames: attachments.map((file) => file.filename),
        }),
        contact_information: clean([name, email || phone].join(' — '), 140),
        ...(productName ? { product_service: 'Product' } : {}),
        ...(itemCode ? { item: itemCode } : {}),
        ...(batchNo ? { batch_no: batchNo } : {}),
        ...(project ? { project_reference: project } : {}),
        ...(location ? { location } : {}),
        ...(date ? { date_of_incident: date } : {}),
        ...(primary ? { attachments: primary.url } : {}),
        // Website Custom Fields (setup_support_requests.py). Until that script
        // runs ERP drops these, and the description above still carries them.
        custom_source: 'Website',
        custom_customer_name: name,
        custom_company_name: company,
        custom_customer_email: email,
        custom_customer_phone: phone,
        custom_reported_batch_no: batch,
        custom_reported_invoice_po: invoice,
      }),
    });
    const ticket = clean(payload.data?.name, 140);

    // Everything below runs against an already-saved request, so a failure is
    // logged and reported but never loses the submission.
    if (ticket && primary && primary.file) {
      try {
        await erpFetch(`/api/resource/File/${encodeURIComponent(primary.file)}`, {
          method: 'PUT',
          body: JSON.stringify({ attached_to_doctype: DOCTYPE, attached_to_name: ticket, attached_to_field: 'attachments' }),
        });
      } catch (error) {
        console.error(`Support request ${ticket} primary attachment link failed:`, error.message);
      }
    }
    const rest = attachments.slice(1);
    if (ticket) {
      const results = await Promise.allSettled(rest.map((file) => erpUploadFile({ ...file, doctype: DOCTYPE, docname: ticket })));
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          warnings.push(rest[index].filename);
          console.error(`Support request ${ticket} attachment upload failed:`, result.reason && result.reason.message);
        }
      });
    } else if (rest.length) {
      warnings.push(...rest.map((file) => file.filename));
      console.error('ERP did not return a ticket name; attachments were not linked.');
    }

    return sendJson(res, 201, {
      ok: true,
      ticket: ticket || null,
      routed_to: topic.category,
      acknowledgement: Boolean(ackEnabled && email),
      attachment_warning: warnings.length > 0,
    });
  } catch (error) {
    console.error('Support request failed:', error.message);
    return sendJson(res, ...errorResponse(error));
  }
};
