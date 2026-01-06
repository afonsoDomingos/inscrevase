const express = require('express');
const router = express.Router();
const { submitForm, getFormSubmissions, updateStatus, getAllSubmissionsAdmin, getMySubmissions } = require('../controllers/submissionController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/submit', submitForm); // Public
router.get('/my-submissions', authMiddleware, getMySubmissions);
router.get('/form/:formId', authMiddleware, getFormSubmissions);
router.get('/all', authMiddleware, adminMiddleware, getAllSubmissionsAdmin);
router.patch('/:id/status', authMiddleware, updateStatus);

module.exports = router;
