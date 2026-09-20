# ERP supplier registration integration

The `/supplier` page registers prospective suppliers as **disabled** `Supplier`
records in ERPNext. `disabled: 1` is set server-side on every submission, so a
self-registered vendor can never be transacted against until procurement
reviews the record and enables it.

## Website surface

One page, `/supplier`, with three parts:

1. **What we procure** — six category tiles. Each tile is a link to `#register`
   that preselects the matching **Supply category** in the form. They used to be
   inert `div`s that looked clickable, which read as a broken page.
2. **How it works** — the three-step review process, copy only.
3. **Supplier registration** — the form described below.

`PROCUREMENT` in `src/supplier-page.jsx` drives both the tiles and the category
dropdown. Its `key` slugs must stay in step with `CATEGORIES` in
`api/_supplier-registration.js`, which rejects any key it does not know.

## The country list

`SUPPLIER_COUNTRIES` in `src/supplier-page.jsx` is **generated**, not
hand-written. `Supplier.country` is a Link field, so a name ERP does not know
fails the insert server-side.

The authoritative list is the option list of the `country` field on the ERP web
form, which is public: fetch `https://erp.bcisaudi.net/supplier-registration`
and read the `Autocomplete` field's `options` array. Note ERP uses forms like
`Antigua & Barbuda` and `Bosnia & Herzegovina`, not the ISO long names.

The lists had drifted: 43 of the 249 countries the website offered were not
accepted by ERP, so any supplier picking one of them got a failed registration.
Re-sync rather than editing either list by hand.

## What the form collects

Company identity (name EN/AR, supplier type, country, city, contact person,
email, mobile, website, CR number, VAT/Tax ID), the supply category, then:

- **Structured offer lines** — up to 20 rows of
  `{ name, unit, price, currency }`. The name is required; the price is
  optional, because many suppliers will not quote before an NDA, and an empty
  price is recorded as *price on request*. A price **does** require a currency,
  from the `CURRENCIES` allow-list shared with the client.
- **Company profile** and **catalog / price list** attachments, both optional.
- Free-text notes (certifications, capacity, lead times).

## How it reaches ERP

`src/supplier-page.jsx` → `submitSupplierRegistration` (`src/ui.jsx`) →
`POST /api/web-form-submit` with `web_form: 'supplier-registration'` →
`api/_supplier-registration.js` → ERP. The handler does three things in order:

1. Validates everything and renders the offer lines into `supplier_details` as
   a readable block:

   ```
   Category: Raw Materials & Chemicals

   Offered products and services:
   1. Titanium dioxide R-902 — 12.5 SAR / kg
   2. Epoxy resin 828 (per drum) — price on request

   Notes:
   ISO 9001 certified, 20t/month capacity.
   ```

2. Creates the `Supplier` through the **guest** `supplier-registration` ERP Web
   Form (`erpWebForm`), exactly as the plain form did — no ERP credential ever
   reaches the browser.
3. Uploads the attachments with `erpUploadFile` against the created Supplier,
   **without** a `fieldname`. They land as ordinary document attachments, so no
   custom Attach field is needed on `Supplier`.

### Why it is not its own api/ route

Vercel caps a deployment at **12 Serverless Functions** and `api/` was already
at exactly 12. Adding `api/supplier-registration.js` made it 13 and the
deployment failed to build — the static site built fine, so the only symptom was
a red deployment and an unchanged live site.

The logic therefore lives in `api/_supplier-registration.js`. The leading
underscore keeps it a shared helper rather than a route, and
`api/web-form-submit.js` delegates to it when the payload carries an `items`
array. **Adding any new file to `api/` without an underscore will break the
deployment the same way** until the plan is upgraded.

`web-form-submit.js` keeps its original flat allow-list for the
`supplier-registration` web form; a payload with no `items` (an old cached copy
of the page) still takes that path.

## ERP field map

`Supplier`'s website-relevant fields are mostly **Custom Fields**, which do not
appear in `/api/resource/DocType/Supplier` — query the `Custom Field` doctype
filtered by `dt = Supplier` to see them.

| website field | ERP field | notes |
| --- | --- | --- |
| Company name | `supplier_name` | required; also the record's name |
| Company name (Arabic) | `supplier_name_in_arabic` | custom |
| Supplier type | `supplier_type` | Select: Company / Individual / Partnership |
| Country | `country` | Link → Country, see above |
| City | `custom_city` | custom |
| Contact person | `custom_contact_person` | custom |
| Email | `email_id` | **Read Only** on the form; ERP derives it from the primary contact it creates |
| Mobile | `mobile_no` | **Read Only**, same as above |
| Website | `website` | |
| CR number | `custom_cr_no` | custom |
| VAT / Tax ID | `tax_id` | |
| Category + items + notes | `supplier_details` | Text, rendered block |
| Offer lines | `custom_supplier_items` | child table, see below |
| Company profile | `custom_company_profile` | Attach field |
| Catalog / price list | — | no field exists; filed as a plain attachment |

`custom_iban` (IBAN) exists in ERP but the website does not ask for it.

### The offer lines child table

`custom_supplier_items` → child doctype **`Supplier Items`**, which has exactly
three columns:

| column | type | what we write |
| --- | --- | --- |
| `item` | Link → Item | **left empty on purpose** |
| `item_name` | Data | the supplier's own wording, plus `(per <unit>)` |
| `price` | Currency | the number, **only when the currency is SAR** |

Three things follow from that shape:

- **`item` stays empty.** ERP does *not* validate Item links on child rows, so a
  free-text product name would be stored verbatim as a broken link. Suppliers
  offer raw materials that are not in BCI's Item master.
- **There is no unit or currency column.** The unit rides in `item_name`, and a
  non-SAR price is appended there too (`Silica sand (per ton) — 40 USD`) with
  `price` left at 0, so a foreign amount is never misread as riyals.
- **`supplier_details` still carries the full text block.** It is the lossless
  copy, and the reason a failed child-table write is logged but not reported to
  the supplier.

`Supplier Items` is a **custom** doctype (module APC), so Customize Form and
Property Setters do not apply to it — `in_list_view` lives on the DocType's own
fields. Originally only `item` had it set, so the grid showed an empty Item
column and hid the data; `item_name` and `price` were switched on (2026-09-20).
`item` is deliberately left visible so staff can still link a real Item by hand.

### How it is written

The guest web form can only set its own 13 fields, so the child table and the
Company Profile attachment are written afterwards with a `PUT` to
`/api/resource/Supplier/<name>` over the token-authenticated REST API — the same
credential the file upload already needs.

## Attachments

| kind | staging prefix | limit | accepted |
| --- | --- | --- | --- |
| `supplier-profile` | `supplier-registration/profile/` | 10 MB | PDF, JPG, PNG, WebP |
| `supplier-catalog` | `supplier-registration/catalog/` | 10 MB | PDF, JPG, PNG, WebP |

Word and Excel are deliberately **not** accepted: the shared validator in
`api/_rfq-file.js` checks magic bytes, and Office formats are ZIP containers
that would weaken that check. The form tells suppliers to export to PDF.

Files are staged to private Vercel Blob by the browser (`blob-upload.js`),
re-validated server-side when read back, pulled into ERP, then deleted from
Blob in a `finally`. The prefixes above live in **two** places that must match:
`FILE_KINDS` in `api/_rfq-file.js` and `FILE_PREFIX` in
`build/blob-upload-entry.mjs`. After editing the latter, re-run
`npm run bundle:blob`.

`build/build.mjs` must also list `supplier` in `needsBlobUpload`, or the built
page never loads the uploader and attachments silently stop working.

## Failure behaviour

- Our own validation errors return 400 with the real message, which the form
  shows verbatim (`Item 2 needs a currency for its price.`).
- **ERP validation errors (Frappe answers 417) are passed through**, prefixed
  with `ERP rejected the registration:`. Frappe puts a human-readable reason in
  `_server_messages` (`Value missing for Supplier: Supplier Name`, `Could not
  find Country: Xyz`) and it tells the supplier what to fix. HTML is stripped
  and the message is capped at 300 characters.
- Anything else (5xx, network) returns 502 with a generic message and the real
  cause goes to the Vercel function log; a missing `ERP_TOKEN` returns 503.
- A **failed attachment does not fail the registration**. The record is already
  saved, so the route returns `attachment_warning: true` and the page asks the
  supplier to email the file to info@bcisaudi.com.
- On success the page shows the ERP reference (`supplier_id`) inline. Unlike the
  RFQ/submittal/sample forms, this one does not navigate to `/thank-you`.

## Local development

The `/api` routes are Vercel functions and do not run under a plain static dev
server. The form detects `localhost` / `127.0.0.1` and says so instead of
showing a bare fetch error — everything else on the page works locally.

## Legacy path

The flat `supplier-registration` entry in `FORMS` (`web-form-submit.js`) is the
original text-only form. The current page never produces that shape, and it is
kept only so a cached copy of the old page still submits successfully.
