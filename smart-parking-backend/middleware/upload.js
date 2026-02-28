// Upload middleware — Smart Parking System
// Uses: busboy (parse incoming multipart/form-data) + file-uploader (POST to remote storage)

const busboy = require('busboy');
const path   = require('path');
const fs     = require('fs');
const fu     = require('file-uploader');

/**
 * parseUpload(fieldName)
 * Express middleware — parses a single file from multipart/form-data using busboy.
 * Saves the file to /uploads locally, then attaches it to req.uploadedFile:
 *   req.uploadedFile = { path, filename, mimetype, size }
 *
 * Usage in routes:
 *   router.post('/spots', parseUpload('photo'), controller);
 */
const parseUpload = (fieldName = 'file') => (req, res, next) => {
  // Only handle multipart requests
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }

  const bb = busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  let handled = false;

  bb.on('file', (name, stream, info) => {
    if (name !== fieldName) { stream.resume(); return; } // skip other fields

    const { filename, mimeType } = info;

    // Validate image type
    const allowed = /\.(jpe?g|png|webp)$/i;
    if (!allowed.test(filename)) {
      stream.resume();
      return next(new Error('Only image files allowed: jpeg, jpg, png, webp'));
    }

    const saveName  = `${Date.now()}-${filename}`;
    const savePath  = path.join(uploadsDir, saveName);
    const writeStream = fs.createWriteStream(savePath);

    let size = 0;
    stream.on('data', (chunk) => { size += chunk.length; });
    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      req.uploadedFile = { path: savePath, filename: saveName, mimetype: mimeType, size };
      handled = true;
    });
  });

  bb.on('finish', () => {
    if (!handled) req.uploadedFile = null;
    next();
  });

  bb.on('error', (err) => next(err));

  req.pipe(bb);
};

/**
 * uploadToRemote(filePath, headers?)
 * Uses file-uploader to POST a local file to the UPLOAD_ENDPOINT in .env.
 * Call this inside your controller after parseUpload middleware.
 *
 * @param {string} filePath  - Absolute path to the local file
 * @param {Object} [headers] - Extra HTTP headers (e.g. Authorization)
 * @returns {Promise<Object>} Remote server response
 *
 * Example in controller:
 *   const { uploadToRemote } = require('../middleware/upload');
 *   const stored = await uploadToRemote(req.uploadedFile.path);
 */
const uploadToRemote = (filePath, headers = {}) => {
  return new Promise((resolve, reject) => {
    const endpoint = process.env.UPLOAD_ENDPOINT || 'http://localhost:5000/uploads';
    const url = new URL(endpoint);

    const options = {
      host:     url.hostname,
      port:     parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname,
      method:   'POST',
      encoding: 'utf8',
      keyname:  'file',
    };

    fu.postFile(options, filePath, headers, (err, response) => {
      // Clean up local temp file after upload
      fs.unlink(filePath, () => {});

      if (err) return reject(err);
      try {
        resolve(JSON.parse(response.body));
      } catch {
        resolve({ body: response.body, statusCode: response.statusCode });
      }
    });
  });
};

module.exports = { parseUpload, uploadToRemote };
