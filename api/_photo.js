const path = require('node:path');

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
};
const ALLOWED_PHOTO_CONTENT_TYPES = [...new Set(Object.values(PHOTO_TYPES).flat())];

function photoError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function safePhotoName(value) {
  return path.basename(String(value || '').trim().slice(0, 180))
    .replace(/[^a-zA-Z0-9._ -]/g, '_');
}

function validatePhotoMetadata({ name, type, size }) {
  const filename = safePhotoName(name);
  const extension = path.extname(filename).toLowerCase();
  const contentType = String(type || '').trim().toLowerCase();
  const fileSize = Number(size);

  if (!filename || !PHOTO_TYPES[extension] || !PHOTO_TYPES[extension].includes(contentType)) {
    throw photoError('Photo must be a JPG, PNG, or WebP image.');
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_PHOTO_BYTES) {
    throw photoError('Photo must be no larger than 5 MB.');
  }
  return { filename, extension, contentType, size: fileSize };
}

function validatePhotoContents(buffer, extension) {
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

  if (!isJpeg && !isPng && !isWebp) {
    throw photoError('The photo contents do not match its file type.');
  }
}

module.exports = {
  ALLOWED_PHOTO_CONTENT_TYPES,
  MAX_PHOTO_BYTES,
  safePhotoName,
  validatePhotoContents,
  validatePhotoMetadata,
};
