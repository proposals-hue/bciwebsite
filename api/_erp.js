const DEFAULT_ERP_BASE = 'https://erp.bcisaudi.net';

function erpBase() {
  return String(process.env.ERP_BASE_URL || DEFAULT_ERP_BASE).replace(/\/$/, '');
}

function authHeader() {
  const raw = String(process.env.ERP_TOKEN || '').trim();
  if (!raw) return '';
  return /^token\s/i.test(raw) ? raw : `token ${raw}`;
}

async function erpFetch(path, options = {}) {
  const auth = authHeader();
  if (!auth) {
    const error = new Error('ERP_TOKEN is not configured');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${erpBase()}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: auth,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  let payload = null;
  try { payload = await response.json(); } catch (_) { /* handled below */ }
  if (!response.ok) {
    const error = new Error(payload?.exception || payload?.message || `ERP returned ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }
  return payload || {};
}

async function erpWebForm(webForm, data) {
  const body = new URLSearchParams({
    web_form: String(webForm || ''),
    data: JSON.stringify(data || {}),
  });
  const response = await fetch(`${erpBase()}/api/method/frappe.website.doctype.web_form.web_form.accept`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  let payload = null;
  try { payload = await response.json(); } catch (_) { /* handled below */ }
  if (!response.ok || payload?.exc || payload?.exception) {
    let serverMessage = '';
    if (payload?._server_messages) {
      try {
        const messages = JSON.parse(payload._server_messages);
        serverMessage = messages.map((item) => {
          try { return JSON.parse(item).message; } catch (_) { return item; }
        }).filter(Boolean).join(' ');
      } catch (_) { /* use the fallback below */ }
    }
    const error = new Error(serverMessage || payload?.exception || payload?.message || `ERP returned ${response.status}`);
    error.statusCode = response.status || 502;
    throw error;
  }
  return payload || {};
}

async function erpUploadFile({ buffer, filename, contentType, doctype, docname, fieldname }) {
  const auth = authHeader();
  if (!auth) {
    const error = new Error('ERP_TOKEN is not configured');
    error.statusCode = 503;
    throw error;
  }

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: contentType }), filename);
  form.append('is_private', '1');
  form.append('doctype', doctype);
  form.append('docname', docname);
  form.append('fieldname', fieldname);

  const response = await fetch(`${erpBase()}/api/method/upload_file`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: auth,
    },
    body: form,
  });

  let payload = null;
  try { payload = await response.json(); } catch (_) { /* handled below */ }
  if (!response.ok || payload?.exc || payload?.exception) {
    const error = new Error(payload?.exception || payload?.message || `ERP returned ${response.status}`);
    error.statusCode = response.status || 502;
    throw error;
  }
  return payload || {};
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = { erpFetch, erpWebForm, erpUploadFile, sendJson };
