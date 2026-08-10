# ERP Customer RFQ integration

The website's quote forms create **draft** `Customer RFQ` records in ERPNext.
Drafts are intentionally left for the BCI sales team to review before submission
or conversion to a quotation.

## Website surfaces

The shared RFQ form is rendered on:

- the homepage contact section;
- the Contact page;
- every buyer-intent SEO landing page.

Product and solution quote links pass the website product family in the URL so
the requester sees the original product context. The requester must still pick
an exact ERP SKU/pack variant before submitting.

## ERP mapping

| Website value | `Customer RFQ` field |
| --- | --- |
| Company / customer name | `customer_name` |
| CR number | `cr_number` |
| VAT number | `vat_number` |
| RFQ date | `transaction_date` |
| Email | `email` |
| Phone | `phone_no` |
| Company logo | `company_logo` |
| CR attachment | `cr_attachment` |
| Product rows | `items` (`Customer RFQ Item`) |
| General notes and website context | `remarks` |

Each item row writes `item_code`, `qty`, `description`, and the canonical
`stock_uom` read from ERP. Contact person, page URL, language, and source page
are recorded at the top of `remarks` because the ERP DocType has no dedicated
fields for them.

## Serverless endpoints

- `GET /api/rfq-items` returns only active, sales-enabled,
  website-synced items from `BCI-Finished Products`. It exposes no prices,
  inventory, or internal purchasing data.
- `POST /api/customer-rfq` validates every SKU again against ERP, creates the
  draft RFQ, transfers optional private attachments, and returns the ERP RFQ ID.
- `POST /api/rfq-file-upload` authorizes temporary private Vercel Blob uploads.
  Files are signature-checked, transferred to ERP as private attachments, and
  removed from temporary Blob storage.

The browser never receives the ERP API token. Deployment uses the existing
`ERP_TOKEN`, `ERP_BASE_URL`, and `BLOB_READ_WRITE_TOKEN` environment variables.

## Limits and validation

- 1–20 unique item rows per RFQ;
- quantity must be greater than zero;
- at least one contact method (email or phone);
- company logo: JPG, PNG, or WebP;
- CR attachment: PDF, JPG, PNG, or WebP;
- maximum attachment size: 5 MB each.

## Verification policy

Normal code verification uses the live ERP only for read-only schema, item,
and permission checks. Do not submit a sample through the production endpoint
unless a real test RFQ is authorized, because that creates a live ERP record.
