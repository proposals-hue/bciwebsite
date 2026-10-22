# ERP customer care / support requests

The `/support` page (+ `/ar/`, `/es/`) is BCI's Customer Care & Support page.
Every request a visitor sends becomes a **Feedback and Improvement Request** in
ERPNext. The ERP record name (`FB-2026-00001`) is the customer's ticket
reference, shown on the page once ERP has saved the record.

## Why this doctype

`Feedback and Improvement Request` is a custom Quality Management doctype that
BCI already set up for complaints and feedback, so the website path inherits the
whole internal process instead of inventing one:

- **Workflow** `Feedback and Improvement Lifecycle`: New → Under Review →
  Assigned → Investigation → Action Required → In Progress → Resolved → Closed
  (plus Rejected / On Hold / Reopened). Transitions belong to Department Manager.
- **Status history**: the `Feedback Request Automation` server script (Before
  Save) appends a `status_history` row on every status change; `track_changes`
  is on as well.
- **SLA**: the same script fills `initial_response_due` / `resolution_due`
  from the `Feedback SLA` record for the priority (Critical 2h/24h, High 4h/48h,
  Medium 24h/120h, Low 48h/240h).
- **Routing**: the script copies `assigned_department` / `assigned_to` from the
  active `Feedback Assignment Rule` for the request's `feedback_category`.
- **Investigation and CAPA**: root cause, immediate / corrective / preventive
  action, evidence of completion, satisfaction rating.

**Material Complain was considered and rejected (2026-10-22).** It is the
sales-side material complaint used internally. Its server scripts reject a
record without a Sales Order or Delivery Note (the customer and sales rep are
derived from it), every item must be on that order, and two photos are
mandatory. That fits staff filing on a customer's behalf, not a public form,
and the client chose to keep the website on this doctype.

## Website surface

Four category cards select the request type and scroll to one form. The form
shows only the fields that type needs:

| Category | Shown | Required beyond the basics |
| --- | --- | --- |
| Submit a Complaint | product, batch / lot, invoice / PO, project, location, purchase / delivery date, photo evidence | product |
| Technical Support | product, project, location | — |
| Order & Delivery | invoice / delivery note / PO, product, project, delivery location, delivery date, photo evidence | invoice / DN / PO no. |
| Feedback & Suggestions | product | — |

The basics are: full name, email **or** mobile (at least one), category, topic
and a description of at least 20 characters. Company and subject are optional;
an empty subject is generated from the topic and product.

Entry points: the footer's **Company** group ("Customer Care") on every page,
the Contact page's **Technical Support** department card, the sitemap and
`llms.txt`. `/support?type=complaint` (or `#complaint`) preselects a category.
Short redirects (`/customer-care`, `/complaints`, `/help`, …) are in
`vercel.json`.

Unlike the RFQ / submittal / sample forms, success does **not** navigate to
`/thank-you`. That page fires the Google Ads lead conversion, and a complaint is
not a lead. The confirmation renders in place instead.

## Topic → ERP mapping

The page sends only a category and topic key. `TOPICS` in
`api/_support-request.js` decides what each files as. `SUPPORT_CATEGORIES` in
`src/support-page.jsx` must use the same keys; its `team` value only drives the
"Routed to" line on the confirmation.

| Category | Topic | request_type | feedback_category | priority |
| --- | --- | --- | --- | --- |
| complaint | product-quality | Complaint | Product Quality | High |
| complaint | packaging | Complaint | Product Quality | Medium |
| complaint | wrong-material | Complaint | Delivery / Logistics | High |
| complaint | service, other | Complaint | Customer Service | Medium |
| technical | application, mixing, compatibility | Incident / Problem | Technical Support | Medium |
| technical | documents | Incident / Problem | Technical Support | Low |
| technical | site-problem | Incident / Problem | Technical Support | High |
| order | delay | Complaint | Delivery / Logistics | High |
| order | quantity, damaged, missing | Complaint | Delivery / Logistics | Medium |
| order | discrepancy | Complaint | Sales | Medium |
| order | billing | Complaint | Finance | Medium |
| feedback | suggestion | Improvement Suggestion | Customer Service | Low |
| feedback | product | Product Feedback | Customer Service | Low |
| feedback | service, compliment | Service Feedback | Customer Service | Low |

The doctype's `General ` request type has a **trailing space** and Frappe strips
the value before checking it against the options, so it can never be saved.
Nothing maps to it.

## What the route writes

`api/_support-request.js` is a helper reached through `api/web-form-submit.js`
(`web_form: 'support-request'`), because Vercel caps the deployment at 12
functions. It writes over the token REST API as `apiuser@bcisaudi.com`.

Standard fields: `company` (Building Chemistry Industry), `user_type` Customer,
`contact_me`, `request_type`, `feedback_category`, `priority`, `subject`,
`description`, `contact_information`, `project_reference`, `location`,
`date_of_incident`, `product_service`, and the first file in `attachments`.

- `item` is linked only if the product passes `_website-item.js`. Otherwise the
  name stays as text. A complaint is never refused over catalogue drift.
- `batch_no` is a Link, so it is set only when the typed batch exists in ERP and
  belongs to the chosen product. Batch and invoice numbers are always kept as
  typed in the description and the custom fields.
- `customer` is deliberately **not** linked from the company name. The endpoint
  is unauthenticated, so staff link the customer after checking who it is.

`description` is an HTML block with every value the form collected, escaped.
That keeps the record complete even before the custom fields below exist (ERP
silently drops keys it has no column for).

## ERP setup (`erp_customizations/support_requests/setup_support_requests.py`)

Read-only unless run with `--apply`, idempotent, token from `ERP_TOKEN`:

```
$env:ERP_TOKEN="<api key>:<api secret>"
python erp_customizations/support_requests/setup_support_requests.py            # dry run
python erp_customizations/support_requests/setup_support_requests.py --apply
python ... --apply --assignee "Product Quality=user@bcisaudi.com"              # optional owners
```

It creates:

1. **Custom Fields**, in a "Website Submission" section: `custom_source`
   ("Website"), `custom_customer_name`, `custom_company_name`,
   `custom_customer_email`, `custom_customer_phone`, `custom_reported_batch_no`,
   `custom_reported_invoice_po`.
2. **Feedback Assignment Rules**: Product Quality → Quality Management - BCI,
   Technical Support → `Technical support  - BCI` (two spaces, as in ERP),
   Delivery / Logistics → Logistics - BCI, Sales → Sales - BCI, Finance →
   Accounts - BCI, Customer Service → Customer Service - BCI. These route
   **every** request in the category, internal ones included.
3. **Notifications**:
   - *Website Support Request - Customer Acknowledgement* (enabled): EN + AR
     email to the customer with the ticket reference.
   - *Website Support Request - Internal Alert* (enabled): to the responsible
     person and a copy to info@bcisaudi.com, with the customer's contacts.
   - *Website Support Request - Customer Status Update* (created **disabled**):
     emails the customer on Under Review / In Progress / Resolved / Closed.

4. **A trimmed form for website requests.** Property Setters give 28 fields and
   sections `depends_on: eval:doc.custom_source!='Website'`. A website record
   then shows 23 fields instead of 58, plus the SLA / assignment / status-history
   fields once they have values. Internal requests keep the full form. Hidden on
   website records: the submitter and anonymity fields, the sales order / PO /
   delivery note / invoice links, the SLA internals, and the whole Investigation
   and Corrective Action, Improvement Evaluation, Resolution Satisfaction, R&D
   and Private sections. In their place, a **Technical Investigation &
   Remarks** section (`custom_technical_remarks`) sits directly under the
   request details. Staff write findings there; it is never emailed to the
   customer. `--apply --reset-layout` deletes the Property Setters and restores
   the full form.

The page says "a confirmation has been emailed" only when the route finds the
acknowledgement Notification enabled **and** the customer gave an email. Its
name is `ACK_NOTIFICATION` in the route; keep it in step with the script.

Emails go out from ERP's default outgoing account (`BCI Notifications`,
proposals@bcisaudi.net). Set `sender` on a Notification to change that.

Existing notifications on the doctype also fire. *Feedback Request Submitted
Alert* emails every Quality Manager and HR Manager on each new request.
*Feedback Request Status Changed Alert* emails `submitted_by`, which for website
requests is the API user, not the customer.

## Attachments

Up to 5 files (JPG, PNG, WebP, HEIC → JPEG, PDF), about 3 MB in total. They
travel **base64-encoded inside the request**, not through Vercel Blob: the Blob
store was suspended on 2026-10-19 (see `docs/erp-careers-integration.md`). The
page re-encodes photos to a 1600px JPEG and enforces the total. The route
re-checks the count, total size (`MAX_ATTACHMENT_TOTAL`), extension and magic
bytes before writing anything. That keeps the body under Vercel's 4.5 MB limit.

The first file is uploaded unattached and named in the insert as the Primary
Attachment, then linked to the record. Updating the record afterwards would run
the workflow's edit rules. The rest are uploaded against the saved record.
A failed upload never loses the request: the route returns
`attachment_warning: true` and the page asks for the file by email, quoting the
ticket.

## Failure behaviour

- Validation errors: 400 with the reason, shown verbatim.
- ERP validation (417 / 409): 400, prefixed "Our system could not log the
  request:", HTML stripped, capped at 300 characters.
- Missing `ERP_TOKEN`: 503. Anything else: 502 with a generic message and phone
  / email fallback; the cause goes to the function log.
- The page shows success only after ERP returns the saved record.

## Testing

`tools/browser/verify-support-page.mjs [out-dir] [--dist]` (local Playwright tooling;
`tools/browser/` is gitignored) screenshots the page
(desktop, validation errors, confirmation with the API mocked, Arabic, phone)
and reports page errors and phone overflow. The `/api` routes do not run under a
static dev server; the form says so instead of failing silently.
