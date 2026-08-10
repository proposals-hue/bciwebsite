const path = require('node:path');

const MAX_RFQ_FILE_BYTES = 5 * 1024 * 1024;
const RFQ_FILE_TYPES = {
  logo: {
    '.jpg': ['image/jpeg', 'application/octet-stream'],
    '.jpeg': ['image/jpeg', 'application/octet-stream'],
    '.png': ['image/png', 'application/octet-stream'],
    '.webp': ['image/webp', 'application/octet-stream'],
  },
  cr: {
    '.pdf': ['application/pdf', 'application/octet-stream'],
    '.jpg': ['image/jpeg', 'application/octet-stream'],
    '.jpeg': ['image/jpeg', 'application/octet-stream'],
    '.png': ['image/png', 'application/octet-stream'],
    '.webp': ['image/webp', 'application/octet-stream'],
  },
};

function rfqFileError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function safeRfqFileName(value) {
  return path.basename(String(value || '').trim().slice(0, 180))
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
}

function allowedRfqContentTypes(kind) {
  const types = RFQ_FILE_TYPES[kind];
  if (!types) throw rfqFileError('Invalid RFQ attachment type.');
  return [...new Set(Object.values(types).flat())];
}

function validateRfqFileMetadata({ name, type, size, kind }) {
  const types = RFQ_FILE_TYPES[kind];
  if (!types) throw rfqFileError('Invalid RFQ attachment type.');

  const filename = safeRfqFileName(name);
  const extension = path.extname(filename).toLowerCase();
  const contentType = String(type || '').trim().toLowerCase() || 'application/octet-stream';
  const fileSize = Number(size);

  if (!filename || !types[extension] || !types[extension].includes(contentType)) {
    throw rfqFileError(kind === 'logo'
      ? 'Company logo must be a JPG, PNG, or WebP image.'
      : 'CR attachment must be a PDF, JPG, PNG, or WebP file.');
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_RFQ_FILE_BYTES) {
    throw rfqFileError('Each RFQ attachment must be no larger than 5 MB.');
  }
  return { filename, extension, contentType, size: fileSize, kind };
}

function validateRfqFileContents(buffer, extension) {
  const isPdf = extension === '.pdf' && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  const isJpeg = ['.jpg', '.jpeg'].includes(extension)
    && buffer.length >= 3
    && buffer[0] === 0xff
    && buffer[1] === 0xd8
    && buffer[2] === 0xff;
  const isPng = extension === '.png'
    && buffer.length >= 8
    && buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  const isWebp = extension === '.webp'
    && buffer.length >= 12
    && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  if (!isPdf && !isJpeg && !isPng && !isWebp) {
    throw rfqFileError('The RFQ attachment contents do not match its file type.');
  }
}

module.exports = {
  MAX_RFQ_FILE_BYTES,
  allowedRfqContentTypes,
  safeRfqFileName,
  validateRfqFileContents,
  validateRfqFileMetadata,
};
