// Upload middleware — Smart Parking System
// Uses: file-uploader (npm i file-uploader) to POST files to remote storage
//       multer (memory storage) to parse incoming multipart/form-data from client

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const fu      = require('file-uploader');

// ── 1. Multer — parse incoming file from client (held in memory) ──
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp/;
  const isValid = allowedExts.test(path.extname(file.originalname).toLowerCase());
  if (isValid) cb(null, true);
  else cb(new Error('Only image files allowed: jpeg, jpg, png, webp'));
};

// Export as Express middleware for routes (e.g. upload.single('photo'))
const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ── 2. file-uploader — POST the parsed file to remote storage ─────
/**
 * Saves buffer to a temp file then uses file-uploader to POST it to
 * the configured UPLOAD_ENDPOINT in .env.
 *
 * @param {Buffer} fileBuffer   - The in-memory file buffer from multer
 * @param {string} originalName - Original filename (used for extension)
 * @param {Object} [headers]    - Extra HTTP headers (e.g. Authorization)
 * @returns {Promise<Object>}   - Remote server response body
 */
const uploadToRemote = (fileBuffer, originalName, headers = {}) => {
  return new Promise((resolve, reject) => {
    const uploadEndpoint = process.env.UPLOAD_ENDPOINT || 'http://localhost:5000/uploads';
    const url = new URL(uploadEndpoint);

    const tmpDir      = path.join(__dirname, '..', 'uploads');
    const tmpFilename = `${Date.now()}-${originalName}`;
    const tmpPath     = path.join(tmpDir, tmpFilename);

    // Ensure uploads dir exists
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // Write buffer to temp file
    fs.writeFile(tmpPath, fileBuffer, (writeErr) => {
      if (writeErr) return reject(writeErr);

      const options = {
        host:     url.hostname,
        port:     parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
        path:     url.pathname,
        method:   'POST',
        encoding: 'utf8',
        keyname:  'file',
      };

      // Use file-uploader to POST the file to the remote endpoint
      fu.postFile(options, tmpPath, headers, (err, response) => {
        // Clean up temp file
        fs.unlink(tmpPath, () => {});

        if (err) return reject(err);

        try {
          resolve(JSON.parse(response.body));
        } catch {
          resolve({ body: response.body, statusCode: response.statusCode });
        }
      });
    });
  });
};

module.exports = { upload, uploadToRemote };
