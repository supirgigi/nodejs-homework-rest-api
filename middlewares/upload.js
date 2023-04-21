const path = require('path');
const multer = require('multer');
const { HttpError } = require('../helpers');

const tempDir = path.join(__dirname, '../', 'tmp');
const maxFileSize = 3145728; // max allowed file size in bytes, 3mb

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: multerConfig,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      cb(null, true);
    } else {
      cb(HttpError(400, 'Only image formats are allowed!'));
    }
  },
});

module.exports = upload;
