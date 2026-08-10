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

window.uploadPrivateRfqFile = (file, kind, clientPayload, onUploadProgress) => {
  const safeKind = kind === 'logo' ? 'logo' : 'cr';
  const safeName = String(file.name || 'attachment')
    .split(/[\\/]/).pop()
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
  return upload(`customer-rfq/${safeKind}/${safeName}`, file, {
    access: 'private',
    contentType: clientPayload?.type || file.type || undefined,
    handleUploadUrl: '/api/rfq-file-upload',
    clientPayload: JSON.stringify({ ...(clientPayload || {}), kind: safeKind }),
    onUploadProgress,
  });
};
