const path = require('node:path');

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_TYPES = {
  '.pdf': ['application/pdf', 'application/octet-stream'],
  '.doc': ['application/msword', 'application/octet-stream'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'],
};
const ALLOWED_CONTENT_TYPES = [...new Set(Object.values(RESUME_TYPES).flat())];

function resumeError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function safeResumeName(value) {
  return path.basename(String(value || '').trim().slice(0, 180))
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
}

function validateResumeMetadata({ name, type, size }) {
  const filename = safeResumeName(name);
  const extension = path.extname(filename).toLowerCase();
  const contentType = String(type || '').trim().toLowerCase() || 'application/octet-stream';
  const fileSize = Number(size);

  if (!filename || !RESUME_TYPES[extension] || !RESUME_TYPES[extension].includes(contentType)) {
    throw resumeError('CV must be a PDF, DOC, or DOCX file.');
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_RESUME_BYTES) {
    throw resumeError('CV must be no larger than 5 MB.');
  }
  return { filename, extension, contentType, size: fileSize };
}

function validateResumeContents(buffer, extension) {
  const isPdf = extension === '.pdf' && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  const isDoc = extension === '.doc' && buffer.subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'));
  const isDocx = extension === '.docx' && buffer[0] === 0x50 && buffer[1] === 0x4b;
  if (!isPdf && !isDoc && !isDocx) {
    throw resumeError('The CV file contents do not match its file type.');
  }
}

module.exports = {
  ALLOWED_CONTENT_TYPES,
  MAX_RESUME_BYTES,
  safeResumeName,
  validateResumeContents,
  validateResumeMetadata,
};
