# ERP careers integration

The Careers page reads vacancies through `/api/jobs` and submits candidates
through `/api/job-application`. Both functions run on Vercel, so the ERP API
credential is never sent to the browser.

## Required Vercel environment variables

- `ERP_TOKEN` — an ERPNext API token in `token api_key:api_secret` format.
- `ERP_BASE_URL` — optional; defaults to `https://erp.bcisaudi.net`.
- `ERP_JOB_SOURCE_DOCTYPE` — optional; defaults first to
  `Request For Job Applicant`, then supports the standard `Job Requisition`
  and `Job Opening` doctypes.
- `ERP_JOB_APPLICANT_SOURCE` — optional Job Applicant Source override. It
  defaults to the existing `Website Listing` source record.
- `ERP_JOB_APPLICANT_REFERENCE_FIELD` — optional custom field on Job Applicant
  used to store the source request ID; defaults to `custom_job_request`.
- `ERP_WEBHOOK_SECRET` — shared secret used only by ERP's job-change webhooks.
- `BLOB_READ_WRITE_TOKEN` — generated automatically by the connected private
  Vercel Blob store and used only for temporary CV transfer.

Give the API user only these permissions:

- Read on `Request For Job Applicant` (or the selected vacancy doctype).
- Create and Write on `Job Applicant`.
- Create on `File` so CVs can be uploaded as private attachments.

The public jobs endpoint exposes only the title, department, location,
employment type, public description, number of positions, deadline, and record
reference. It never returns the full ERP document to the browser.

## Automatic updates

ERP webhooks call `/api/erp-job-webhook` for insert, update, submit, cancel, and
delete events on `Request For Job Applicant`. Requests authenticate with a
private bearer secret. The public jobs response is `no-store`, so a Careers-page
visit immediately reads the current ERP state without a website rebuild or CDN
cache delay.

## Publishing behaviour

For `Request For Job Applicant`, a new **submitted** request appears on the
website within about one minute. Draft and Completed requests remain internal. If the doctype has a `publish`,
`publish_on_website`, `published`, `show_on_website`, or `website_visible`
checkbox, only checked records appear. Closed, filled, rejected, and cancelled
requests are hidden.

Standard `Job Requisition` records must be Approved/Open & Approved. Standard
`Job Opening` records must be Open with **Publish on website** enabled.

## Applicant flow

Clicking the green hiring bar or a role's Apply button opens the Careers form
with that ERP request selected. A successful submission creates a `Job
Applicant` record. If the vacancy is linked to a standard Job Opening, the
applicant is linked through `job_title`; otherwise the request ID is included
in the cover letter and linked through `custom_job_request` (or the field
selected with `ERP_JOB_APPLICANT_REFERENCE_FIELD`). For a selected vacancy,
the ERP Position value shown on the website is also written to the Job
Applicant's `designation` field. Open applications leave Designation blank.

The CV is required and uploaded as a private PDF, DOC, or DOCX attachment to
the Job Applicant's standard `resume_attachment` field. The website accepts
files up to 5 MB and does not ask applicants for an external CV link. The
browser uploads the file directly to the private `bci-career-cvs` Blob store;
the application API validates and transfers it to ERP, then deletes the
temporary Blob object.

A recent applicant photo is also required. The website accepts JPG, PNG, and
WebP images up to 5 MB, validates their file signatures, and transfers them to
the Job Applicant's private `custom_applicant_photo` Attach Image field. Job
Applicant uses this field as its ERP image field, so the picture is visible on
the applicant record. Photo uploads use the same private temporary Blob flow
and are deleted after the ERP transfer.

The position selector is required. Applicants must choose a published vacancy
or explicitly choose Open application; leaving it blank can no longer create an
ambiguous open application in ERP. Created records use the `Website Listing`
source by default.
