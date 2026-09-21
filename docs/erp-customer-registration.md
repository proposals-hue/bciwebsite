# ERP customer registration integration

The `/customer-registration` page opens a trade account for a prospective buyer
by creating a **disabled** `Customer` record in ERPNext. `disabled: 1` is set
server-side on every submission, so a self-registered buyer can never be
transacted against until sales reviews the record and enables it.

## Website surface

One page, `/customer-registration` (+ `/ar/`, `/es/`), with three parts:

1. **Why register** — four benefit tiles, copy only.
2. **How it works** — register → review → start buying.
3. **Customer registration** — the form described below.

Entry points (there is deliberately **no desktop top-nav item** — an 8th pushes
the "Get a Quote" CTA off-screen at 1024px; see the comment on `NAV` in
`src/data.jsx`): the footer's **Company** group sitewide, the mobile drawer
("Open an Account", a `NAV` entry flagged `mobileOnly`), the sitemap and
`llms.txt`.

## What the form collects

**Required:** company name, account type (Company / Individual / Partnership),
country, city, address, contact person, email, mobile, CR number, at least one
product line, a company logo and the commercial registration document.

**Optional:** company name in Arabic, VAT number, VAT certificate, website, and
a free-text notes field. A small contractor may have none of these, and the
supplier form's mandatory-everything rule is a known source of lost
registrations — do not copy it here without a reason.

`CUSTOMER_INTERESTS` in `src/customer-registration-page.jsx` drives the product
line checkboxes. Its `key` slugs must stay in step with `INTERESTS` in
`api/_customer-registration.js`, which drops any key it does not know and then
rejects the submission if nothing is left.

## Why this does NOT use a guest ERP Web Form

The supplier registration goes through the guest `supplier-registration` web
form. This one cannot: ERP makes **`custom_image` mandatory on Customer**, and a
web form cannot carry a file. The image has to already exist in ERP and be named
in the very insert that creates the record.

So the whole record is written over the **token-authenticated REST API** from
`api/_customer-registration.js`: the logo is uploaded first and unattached, and
its `file_url` goes into the `POST /api/resource/Customer` body. No ERP
credential reaches the browser either way — the Vercel function holds the token
in both designs.

It is a helper, not a route. `api/` is at Vercel's **12-function cap**, so it
keeps its leading underscore and is reached through `api/web-form-submit.js`,
which dispatches on `web_form === 'customer-registration'`.

## The ERP field traps

Customer has more mandatory fields than it looks like it does, and they do not
all show up in the same place.

| Field | Where the rule lives | What the route does |
| --- | --- | --- |
| `custom_cr_number` | Custom Field, `reqd` | Collected; required on the form too |
| `custom_image` | Custom Field, `reqd` | The company logo, uploaded before the insert |
| `custom_type` | Custom Field, `reqd`, labelled **"Expo Type"** | Filled with the customer's **city** |
| `default_sales_partner` | **Property Setter**, `reqd` | `Website` |
| `sales_team` | **Property Setter**, `reqd` | One row, sales person `Website`, 100% |

Two things to know about that table:

- **Property Setters do not appear in a `Custom Field` query.** Querying
  `Custom Field` filtered by `dt = Customer` finds the first three and misses
  `sales_team` / `default_sales_partner` entirely. The insert then fails with
  `MandatoryError: sales_team, default_sales_partner` and nothing in the field
  list explains why. Query `Property Setter` filtered by `doc_type = Customer`
  as well.
- `custom_type` is labelled "Expo Type" and its `options` still list
  `Riyadh Expo` / `Jeddah Expo`, but the field is a **Data** field and every
  record created recently uses it as the city (`Riyadh`, `Dammam`, `Jeddah`,
  `Al Khobar`). The city is what goes in it.

There are also three stale Property Setters — `contact_number`,
`email_address`, `interested_items`, all `reqd = 1` — for fields that no longer
exist on Customer. They are inert; ignore them.

### Sales ownership

`Sales Partner: Website` and `Sales Person: Website` (a leaf under the existing
`Sales Team` root) were created for this integration, so self-registrations sit
in an obvious unassigned queue until sales reassigns them.

**Consequence worth knowing:** the `Customer SP Filter Query` permission script
restricts Sales Users who hold a `Sales Person` / `Sales Partner` User
Permission to customers matching `default_sales_partner`. Those users will *not*
see website registrations. Sales Managers, Stock Managers, System Managers and
any sales user without such a User Permission do. If registrations go
unnoticed, that script is why.

### Other defaults the route sets

`customer_group: BCI`, `territory` mapped from the country (ERP holds only
`Saudi Arabia`, `Kuwait`, `Bahrain`, `Sudan`, `Yeman` — note the spelling — and
everything else falls back to `Rest Of The World`), `custom_customer_type: Cash`
and `custom_credit_status: Not Requested`. Credit stays with the existing
`Customer Credit Request` workflow and is never touched from the website.
`bill_type` follows the account type (`Individual` → B2C, otherwise B2B).

## What ERP does by itself, and what it doesn't

- ERPNext **creates the primary Contact** from `email_id` / `mobile_no` on
  insert. Both are `Read Only` in the ERP form but settable over REST.
- ERPNext does **not** create an Address. The route creates one explicitly
  (`Billing`, also flagged shipping, linked through `links`) and then PUTs
  `customer_primary_address` back onto the Customer — creating the Address alone
  does not link it.
- `Customer Default Cash Credit Type` (Before Save) fills
  `custom_customer_type` / `custom_credit_status` if they are blank.
- `Customer Duplicate CR Number Validation` (Before Validate) rejects a CR
  number already held by another customer — see below.

## Duplicate handling

**Frappe does not reject a duplicate customer name.** Customer is named by
Customer Name (`Selling Settings.cust_master_name`), and on a collision Frappe
silently appends a suffix: a second submission produces `Acme Trading - 1` as a
separate account, and sales cannot tell which one is real. This is the opposite
of Supplier's behaviour and was confirmed against the live ERP.

So both duplicates are checked **before the insert**, not left to ERP:

- an existing `customer_name` → 409, "An account for X is already registered…"
- an existing `custom_cr_number` → 409, a generic "This CR number is already
  registered with BCI."

The CR message is deliberately vague. ERP's own message names the other party
("CR Number 123 is already used by Customer Acme Trading") and **this endpoint
is unauthenticated**, so passing it through would let anyone probe CR numbers
and read back BCI's customer list. `CR_LEAK` in the route scrubs that message if
it ever reaches the generic error path — which it can, since two simultaneous
submissions can still race past the pre-check.

## Attachments

Files are staged by the browser in private Vercel Blob and pulled server-side
into ERP, the same mechanism as the RFQ, submittal and supplier forms.

- `customer-logo` (JPG/PNG/WebP, 5 MB) → `custom_image`
- `customer-cr` (PDF/JPG/PNG/WebP, 10 MB) → plain document attachment
- `customer-vat` (PDF/JPG/PNG/WebP, 10 MB) → plain document attachment, optional

The kinds live in `FILE_KINDS` (`api/_rfq-file.js`) and their staging prefixes
must match `FILE_PREFIX` in `build/blob-upload-entry.mjs`; after changing that
file run `npm run bundle:blob`. `build/build.mjs` must also list
`customer-registration` in `needsBlobUpload`, or the built page never loads the
uploader and attachments silently stop working.

The same browser-side pre-check applies as on the supplier page and for the same
reason: `upload()` from `@vercel/blob/client` discards the authorizer's response
body and throws a bare `Failed to retrieve the client token` for any non-2xx, so
`customerFileProblem()` mirrors `FILE_KINDS` and refuses the file in the browser
with a translated message that names it. Keep the two lists in step.

**ERP runs pypdf over uploaded PDFs** and rejects a malformed one with
`PdfReadError: startxref not found`. That costs the attachment, not the
registration.

## Failure behaviour

- Our own validation errors return 400 with the real message, shown verbatim.
- Duplicate name / CR return 409 with the messages above.
- ERP validation errors (Frappe answers 417) are passed through, prefixed with
  `ERP rejected the registration:`, HTML stripped, capped at 300 characters —
  except anything matching `CR_LEAK`.
- Anything else returns 502 with a generic message and the real cause goes to
  the Vercel function log; a missing `ERP_TOKEN` returns 503.
- A **failed attachment does not fail the registration**. The record is already
  saved, so the route returns `attachment_warning: true` and the page asks the
  customer to email the file to info@bcisaudi.com. The same applies to the
  Address and the logo-File link: both are best-effort, and `customer_details`
  carries the address in readable form regardless.
- On success the page shows the ERP reference (`customer_id`) inline. Like the
  supplier form and unlike the RFQ/submittal/sample forms, it does not navigate
  to `/thank-you`.

## Local development

The `/api` routes are Vercel functions and do not run under a plain static dev
server. The form detects `localhost` / `127.0.0.1` and says so instead of
showing a bare fetch error — everything else on the page works locally.
