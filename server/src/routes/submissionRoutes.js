const express = require('express');
const router = express.Router();
const { submitForm, getFormSubmissions, updateStatus } = require('../controllers/submissionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/submit', submitForm); // Public
router.get('/form/:formId', authMiddleware, getFormSubmissions);
router.patch('/:id/status', authMiddleware, updateStatus);

module.exports = router;
