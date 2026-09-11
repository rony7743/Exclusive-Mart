const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contactController');

router.post('/contact', sendContactMessage);

module.exports = router;

