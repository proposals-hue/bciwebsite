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
  // Omitted when the document does not exist yet: the file is then created
  // unattached and linked to its document afterwards.
  if (doctype) form.append('doctype', doctype);
  if (docname) form.append('docname', docname);
  if (fieldname) form.append('fieldname', fieldname);

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

// Vercel does not reliably run code after the response has been sent. Routes
// that stage uploads in Blob used to delete them in a `finally` that ran after
// `return sendJson(res, …)`; those deletes were dropped and the Hobby store
// filled up (1 GB) and was suspended on 2026-10-19. Such routes now send their
// reply into holdResponse(res), delete the staged files, then call flush().
function holdResponse(res) {
  let statusCode = 200;
  let body = '';
  const headers = [];
  return {
    get statusCode() { return statusCode; },
    set statusCode(value) { statusCode = value; },
    setHeader(name, value) { headers.push([name, value]); },
    end(value) { body = value; },
    flush() {
      res.statusCode = statusCode;
      for (const [name, value] of headers) res.setHeader(name, value);
      res.end(body);
    },
  };
}

module.exports = { erpFetch, erpWebForm, erpUploadFile, sendJson, holdResponse };
