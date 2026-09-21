import { upload } from '@vercel/blob/client';

// Must stay byte-for-byte equivalent to safeRfqFileName / safeResumeName /
// safePhotoName in api/. The upload authorizer compares the staging path it
// would have spelled against the one the browser asks for and rejects any
// difference — and @vercel/blob reports that rejection only as the opaque
// "Failed to retrieve the client token", so a drift here is near-undebuggable.
// The 180-character cap keeps the extension, or the type check downstream sees
// a truncated name with no extension at all and blames the file format.
function safeStagedName(value, fallback) {
  const base = String(value || '').trim()
    .split(/[\\/]/).pop()
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
  if (!base) return fallback;
  if (base.length <= 180) return base;
  const dot = base.lastIndexOf('.');
  const extension = dot > 0 && base.length - dot <= 12 ? base.slice(dot) : '';
  return base.slice(0, 180 - extension.length) + extension;
}

window.uploadPrivateCv = (file, clientPayload, onUploadProgress) => {
  const safeName = safeStagedName(file.name, 'cv.pdf');
  return upload(`job-cvs/${safeName}`, file, {
    access: 'private',
    contentType: clientPayload?.type || file.type || undefined,
    handleUploadUrl: '/api/job-cv-upload',
    clientPayload: JSON.stringify(clientPayload || {}),
    onUploadProgress,
  });
};

window.uploadPrivateApplicantPhoto = (file, clientPayload, onUploadProgress) => {
  const safeName = safeStagedName(file.name, 'photo.jpg');
  return upload(`job-photos/${safeName}`, file, {
    access: 'private',
    contentType: clientPayload?.type || file.type || undefined,
    handleUploadUrl: '/api/job-photo-upload',
    clientPayload: JSON.stringify(clientPayload || {}),
    onUploadProgress,
  });
};

// Staging prefixes must match FILE_KINDS in api/_rfq-file.js — the upload
// authorizer rejects any other path for the declared kind.
const FILE_PREFIX = {
  logo: 'customer-rfq/logo/',
  cr: 'customer-rfq/cr/',
  spec: 'submittal-request/spec/',
  'supplier-logo': 'supplier-registration/logo/',
  'supplier-profile': 'supplier-registration/profile/',
  'supplier-catalog': 'supplier-registration/catalog/',
};

window.uploadPrivateRfqFile = (file, kind, clientPayload, onUploadProgress) => {
  const safeKind = FILE_PREFIX[kind] ? kind : 'cr';
  const safeName = safeStagedName(file.name, 'attachment');
  return upload(`${FILE_PREFIX[safeKind]}${safeName}`, file, {
    access: 'private',
    contentType: clientPayload?.type || file.type || undefined,
    handleUploadUrl: '/api/rfq-file-upload',
    clientPayload: JSON.stringify({ ...(clientPayload || {}), kind: safeKind }),
    onUploadProgress,
  });
};
