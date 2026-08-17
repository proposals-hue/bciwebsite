const path = require('node:path');
const { get } = require('@vercel/blob');

const MB = 1024 * 1024;
const IMAGE_TYPES = {
  '.jpg': ['image/jpeg', 'application/octet-stream'],
  '.jpeg': ['image/jpeg', 'application/octet-stream'],
  '.png': ['image/png', 'application/octet-stream'],
  '.webp': ['image/webp', 'application/octet-stream'],
};
const PDF_TYPE = { '.pdf': ['application/pdf', 'application/octet-stream'] };

// Every attachment a website form stages in Vercel Blob before it reaches ERP:
// where it may be stored, what it may contain and how large it may be. The
// `kind` travels with the upload token, so these limits are enforced when the
// browser asks for the token AND again when the ERP handler reads the blob.
const FILE_KINDS = {
  logo: {
    prefix: 'customer-rfq/logo/', maxBytes: 5 * MB, types: { ...IMAGE_TYPES },
    message: 'Company logo must be a JPG, PNG, or WebP image.',
  },
  cr: {
    prefix: 'customer-rfq/cr/', maxBytes: 5 * MB, types: { ...PDF_TYPE, ...IMAGE_TYPES },
    message: 'CR attachment must be a PDF, JPG, PNG, or WebP file.',
  },
  spec: {
    prefix: 'submittal-request/spec/', maxBytes: 10 * MB, types: { ...PDF_TYPE, ...IMAGE_TYPES },
    message: 'The project specification must be a PDF, JPG, PNG, or WebP file.',
  },
};

function rfqFileError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function fileKind(kind) {
  const config = FILE_KINDS[kind];
  if (!config) throw rfqFileError('Invalid attachment type.');
  return config;
}

function safeRfqFileName(value) {
  return path.basename(String(value || '').trim().slice(0, 180))
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
}

function allowedRfqContentTypes(kind) {
  return [...new Set(Object.values(fileKind(kind).types).flat())];
}

function maxFileBytes(kind) {
  return fileKind(kind).maxBytes;
}

function blobPathPrefix(kind) {
  return fileKind(kind).prefix;
}

function validateRfqFileMetadata({ name, type, size, kind }) {
  const config = fileKind(kind);

  const filename = safeRfqFileName(name);
  const extension = path.extname(filename).toLowerCase();
  const contentType = String(type || '').trim().toLowerCase() || 'application/octet-stream';
  const fileSize = Number(size);

  if (!filename || !config.types[extension] || !config.types[extension].includes(contentType)) {
    throw rfqFileError(config.message);
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > config.maxBytes) {
    throw rfqFileError(`Each attachment must be no larger than ${config.maxBytes / MB} MB.`);
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
    throw rfqFileError('The attachment contents do not match its file type.');
  }
}

// Reads back a file the browser staged in private Vercel Blob storage. The
// reference is untrusted, so the host, the path prefix, the declared metadata
// and the magic bytes are all re-checked before the buffer is handed to ERP.
async function readPrivateBlob(file, kind) {
  if (!file || typeof file !== 'object' || !file.url) return null;

  let parsedUrl;
  try { parsedUrl = new URL(String(file.url)); }
  catch (_) { throw rfqFileError('The uploaded attachment reference is invalid.'); }
  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.private.blob.vercel-storage.com')) {
    throw rfqFileError('The uploaded attachment reference is invalid.');
  }

  const declared = validateRfqFileMetadata({ ...file, kind });
  const result = await get(parsedUrl.href, { access: 'private', useCache: false });
  const prefix = blobPathPrefix(kind);
  if (!result || result.statusCode !== 200 || !result.stream || !result.blob.pathname.startsWith(prefix)) {
    throw rfqFileError('The uploaded attachment could not be found.');
  }
  const stored = validateRfqFileMetadata({
    name: declared.filename,
    type: result.blob.contentType,
    size: result.blob.size,
    kind,
  });
  if (stored.size !== declared.size || stored.contentType !== declared.contentType) {
    throw rfqFileError('The uploaded attachment details do not match the stored file.');
  }

  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
  if (buffer.length !== stored.size) throw rfqFileError('The uploaded attachment is incomplete.');
  validateRfqFileContents(buffer, stored.extension);
  return { buffer, filename: stored.filename, contentType: stored.contentType };
}

module.exports = {
  allowedRfqContentTypes,
  blobPathPrefix,
  maxFileBytes,
  readPrivateBlob,
  rfqFileError,
  safeRfqFileName,
  validateRfqFileContents,
  validateRfqFileMetadata,
};
