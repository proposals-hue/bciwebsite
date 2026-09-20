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
`api/supplier-registration.js`, which rejects any key it does not know.

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
`POST /api/supplier-registration` → ERP. The route does three things in order:

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

### Why the prices are text, not a child table

`Supplier` has no child table for offered items, and adding one is an ERP schema
change that has to be run against the live instance. Until that exists, the
lines are serialized into `supplier_details` (capped at 5000 characters).

If the prices ever need to be queryable or comparable in ERP, the follow-up is:
create a child doctype (e.g. `Supplier Offered Item` with
`item_name / uom / rate / currency`), add it to `Supplier`, then swap the
`details` block in `api/supplier-registration.js` for a real child-table array.
The website form already collects the fields in that shape.

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

- Validation errors return 400 with the real message, which the form shows
  verbatim (`Item 2 needs a currency for its price.`).
- ERP failures return 502 with a generic message; the real cause is logged.
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

`web-form-submit.js` still carries a `supplier-registration` entry from the
original text-only form. It is no longer used by the page, and is kept only so
that a cached copy of the old page still submits successfully.
