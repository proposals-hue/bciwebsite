const { erpFetch, sendJson } = require('./_erp');

const SOURCE_DOCTYPES = [
  process.env.ERP_JOB_SOURCE_DOCTYPE,
  'Request For Job Applicant',
  'Job Requisition',
  'Job Opening',
].filter(Boolean);

const text = (value) => String(value == null ? '' : value).trim();
const first = (doc, fields) => {
  for (const field of fields) if (text(doc[field])) return text(doc[field]);
  return '';
};
const truthy = (value) => value === true || value === 1 || /^(1|yes|true)$/i.test(text(value));
const plainText = (value) => text(value)
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim();

function isPublic(doc, doctype) {
  const publishFields = ['publish', 'publish_on_website', 'published', 'show_on_website', 'website_visible'];
  const presentPublishFields = publishFields.filter((field) => doc[field] !== undefined && doc[field] !== null);
  if (presentPublishFields.length && !presentPublishFields.some((field) => truthy(doc[field]))) return false;

  const workflowState = text(doc.workflow_state).toLowerCase();
  const status = text(doc.status).toLowerCase();
  const state = workflowState || status;
  const blockedStates = ['cancelled', 'canceled', 'closed', 'completed', 'filled', 'rejected'];
  if ([workflowState, status].some((value) => blockedStates.includes(value))) return false;
  if (doctype === 'Job Opening') return status === 'open' && truthy(doc.publish);
  if (doctype === 'Job Requisition') {
    return ['approved', 'open', 'open & approved', 'open and approved'].includes(state);
  }
  // The BCI custom request doctype is itself the publishing queue. Never expose
  // cancelled/closed requests, and honour a publish checkbox when one exists.
  // This custom doctype is submittable in BCI ERP. Draft requests are internal;
  // only submitted requests (docstatus = 1) are vacancies ready for applicants.
  if (doctype === 'Request For Job Applicant') {
    return Number(doc.docstatus) === 1 && (!status || status === 'open');
  }
  if (state) return ['approved', 'open', 'open & approved', 'open and approved'].includes(state);
  return Number(doc.docstatus) === 1;
}

function normalize(doc, doctype) {
  const title = first(doc, ['job_designation', 'job_title', 'designation', 'position_title', 'position', 'requested_position']);
  if (!title) return null;
  const description = plainText(first(doc, ['job_description', 'description', 'reason_for_request', 'remarks']));
  const opening = first(doc, ['job_opening', 'linked_job_opening']);
  return {
    id: text(doc.name),
    source_doctype: doctype,
    job_opening: doctype === 'Job Opening' ? text(doc.name) : opening,
    title,
    department: first(doc, ['department', 'division']) || 'BCI',
    location: first(doc, ['location', 'work_location', 'branch']) || 'Saudi Arabia',
    employment_type: first(doc, ['employment_type', 'job_type']) || 'Full-time',
    description: description.slice(0, 320),
    positions: Number(first(doc, ['no_of_positions', 'number_of_positions', 'vacancies', 'required_employees'])) || 1,
    expected_by: first(doc, ['expected_by', 'closing_date', 'application_deadline']),
    modified: text(doc.modified),
  };
}

async function fetchSource(doctype) {
  const params = new URLSearchParams({
    fields: JSON.stringify(['*']),
    limit_page_length: '100',
    order_by: 'modified desc',
  });
  const payload = await erpFetch(`/api/resource/${encodeURIComponent(doctype)}?${params}`);
  const rows = Array.isArray(payload.data) ? payload.data : [];
  return rows.filter((doc) => isPublic(doc, doctype)).map((doc) => normalize(doc, doctype)).filter(Boolean);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  // ERP sends change webhooks, so never let the CDN hold an old vacancy list.
  // Every Careers-page visit receives the current ERP state immediately.
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const errors = [];
  for (const doctype of [...new Set(SOURCE_DOCTYPES)]) {
    try {
      const jobs = await fetchSource(doctype);
      return sendJson(res, 200, { jobs, source: doctype, updated_at: new Date().toISOString() });
    } catch (error) {
      errors.push(`${doctype}: ${error.message}`);
      if (error.statusCode === 503) break;
    }
  }

  console.error('ERP jobs feed failed:', errors.join(' | '));
  return sendJson(res, errors.some((e) => e.includes('ERP_TOKEN')) ? 503 : 502, {
    error: 'The vacancies feed is temporarily unavailable.',
  });
};
