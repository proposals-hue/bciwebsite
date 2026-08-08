const { erpWebForm, sendJson } = require('./_erp');

const clean = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

const FORMS = {
  'contact-bci': {
    fields: {
      doctype: 40,
      lead_name: 140,
      company_name: 140,
      email_id: 180,
      mobile_no: 40,
      custom_message: 5000,
    },
    validate(data) {
      if (!data.lead_name) return 'Please provide your name.';
      if (!data.email_id && !data.mobile_no) return 'Please provide an email address or phone number.';
      if (data.email_id && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_id)) return 'Please provide a valid email address.';
      return '';
    },
  },
  'supplier-registration': {
    fields: {
      doctype: 40,
      supplier_name: 140,
      supplier_name_in_arabic: 140,
      supplier_type: 40,
      country: 140,
      email_id: 180,
      mobile_no: 40,
      website: 1000,
      custom_cr_no: 140,
      tax_id: 140,
      supplier_details: 5000,
      custom_city: 140,
      custom_contact_person: 140,
      disabled: 1,
    },
    validate(data) {
      if (!data.supplier_name || !data.email_id || !data.supplier_details) {
        return 'Company name, email, and products or services are required.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_id)) return 'Please provide a valid email address.';
      if (!['Company', 'Individual', 'Partnership'].includes(data.supplier_type)) return 'Please select a valid supplier type.';
      if (data.website && !/^https?:\/\//i.test(data.website)) return 'The website address must start with http:// or https://.';
      return '';
    },
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (body.website_check) return sendJson(res, 200, { ok: true }); // honeypot

    const webForm = clean(body.web_form, 80);
    const config = FORMS[webForm];
    if (!config) return sendJson(res, 400, { error: 'Unsupported form.' });

    const input = body.data && typeof body.data === 'object' ? body.data : {};
    const data = {};
    for (const [field, max] of Object.entries(config.fields)) data[field] = clean(input[field], max);
    if (webForm === 'supplier-registration') {
      data.disabled = 1;
      data.supplier_type = data.supplier_type || 'Company';
    }

    const validationError = config.validate(data);
    if (validationError) return sendJson(res, 400, { error: validationError });

    const payload = await erpWebForm(webForm, data);
    return sendJson(res, 201, { ok: true, document_id: payload.message?.name || null });
  } catch (error) {
    console.error('ERP web form submission failed:', error.message);
    const status = error.statusCode === 429 ? 429 : 502;
    return sendJson(res, status, { error: 'ERP did not accept the submission. Please review the fields and try again.' });
  }
};
