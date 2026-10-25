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

For `Request For Job Applicant`, a request appears on the website within about
one minute of being **submitted**. It stays listed through the Interviewed and
Offered stages, and is hidden once it is Selected or Cancelled. Draft and
Completed requests remain internal. The location shown is the request's
`work_location` city, with its capitalisation tidied; the `location` field
(Inside/Outside Country) is not shown.

If the doctype has a `publish`, `publish_on_website`, `published`,
`show_on_website`, or `website_visible` checkbox, only checked records appear.
Closed, filled, rejected, selected, and cancelled requests are always hidden.

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
Applicant's `designation` field.

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

**Inline uploads (since 2026-10-21).** Every photo is first shrunk in the browser
to a JPEG no larger than 1280 px. When the CV and the photo together fit about 4 MB
once base64-encoded, both are sent inside the `/api/job-application` request as
`resume_file` / `photo_file`, with no Blob staging. Vercel caps request bodies at
4.5 MB. In practice this covers CVs up to roughly 2.5–2.8 MB. Only larger CVs use
the Blob flow described above. This change was made while the Blob store was
suspended, and it also keeps Blob usage low.

The vacancy title is written to Job Applicant `designation` only when a matching
`Designation` exists in ERP; the match ignores letter case. ERP would reject an
unmatched title, such as a typo on the request, so the website leaves the field blank
instead. The title is always included in the cover letter.

The position selector is required and lists only published vacancies. There is
no "Other position" or open-application option: `/api/job-application`
rejects any submission that is not tied to a vacancy (a Job Opening or an ERP
request reference). Created records use the `Website Listing` source by default.
