import { upload } from '@vercel/blob/client';

window.uploadPrivateCv = (file, clientPayload, onUploadProgress) => {
  const safeName = String(file.name || 'cv.pdf').replace(/[^a-zA-Z0-9._ -]/g, '_');
  return upload(`job-cvs/${safeName}`, file, {
    access: 'private',
    contentType: clientPayload?.type || file.type || undefined,
    handleUploadUrl: '/api/job-cv-upload',
    clientPayload: JSON.stringify(clientPayload || {}),
    onUploadProgress,
  });
};

window.uploadPrivateApplicantPhoto = (file, clientPayload, onUploadProgress) => {
  const safeName = String(file.name || 'photo.jpg').replace(/[^a-zA-Z0-9._ -]/g, '_');
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
};

window.uploadPrivateRfqFile = (file, kind, clientPayload, onUploadProgress) => {
  const safeKind = FILE_PREFIX[kind] ? kind : 'cr';
  const safeName = String(file.name || 'attachment')
    .split(/[\\/]/).pop()
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
  return upload(`${FILE_PREFIX[safeKind]}${safeName}`, file, {
    access: 'private',
    contentType: clientPayload?.type || file.type || undefined,
    handleUploadUrl: '/api/rfq-file-upload',
    clientPayload: JSON.stringify({ ...(clientPayload || {}), kind: safeKind }),
    onUploadProgress,
  });
};
