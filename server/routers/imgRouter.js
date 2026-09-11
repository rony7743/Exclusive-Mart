const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage } = require('../controllers/imageController');

// Configure Multer with memory storage and file validation
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).array('images', 10); // Max 10 images

// Route to handle multiple image uploads with error handling
router.post('/image', (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, uploadImage);

module.exports = router;