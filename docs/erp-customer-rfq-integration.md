# ERP Customer RFQ integration

The website's quote forms create **draft** `Customer RFQ` records in ERPNext.
Drafts are intentionally left for the BCI sales team to review before submission
or conversion to a quotation.

## Website surfaces

The RFQ form is rendered on the dedicated `/request-quote` page. Header,
footer, product, solution, and buyer-intent landing-page quote links send
visitors to this page. The homepage and Contact page keep a shorter general
enquiry form that creates a CRM Lead through the `contact-bci` ERP Web Form.

The RFQ is split into four steps:

1. contact and company details;
2. guided application/category browsing or direct ERP product search, followed
   by quantities;
3. project details plus optional CR/VAT information and documents;
4. review and submission.

Product and solution quote links pass the website product family in the URL so
the requester sees the original product context. The requester must still pick
an exact ERP SKU/pack variant before submitting.

When the form runs from a plain localhost static server, the ERP API routes are
not available. Local previews therefore use the website catalogue for product
discovery and clearly label it as preview data; production continues to require
the live ERP catalogue before submission.

## ERP mapping

| Website value | `Customer RFQ` field |
| --- | --- |
| Company / customer name | `customer_name` |
| CR number | `cr_number` |
| VAT number | `vat_number` |
| RFQ date | `transaction_date` |
| Email | `email` |
| Phone | `phone_no` |
| Project name | `remarks` context |
| Delivery location | `remarks` context |
| Required date | `remarks` context |
| Company logo | `company_logo` |
| CR attachment | `cr_attachment` |
| Product rows | `items` (`Customer RFQ Item`) |
| General notes and website context | `remarks` |

Each item row writes `item_code`, `qty`, `description`, and the canonical
`stock_uom` read from ERP. Contact person, project name, delivery location,
required date, page URL, language, and source page are recorded at the top of
`remarks` because the ERP DocType has no dedicated fields for them.

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

The browser only displays a success confirmation after the API returns the
created ERP `Customer RFQ` document ID. A generic HTTP success response is not
treated as a registered RFQ.

## Verification policy

Normal code verification uses the live ERP only for read-only schema, item,
and permission checks. Do not submit a sample through the production endpoint
unless a real test RFQ is authorized, because that creates a live ERP record.
