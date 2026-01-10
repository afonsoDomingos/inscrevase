const express = require('express');
const router = express.Router();
const {
    submitForm,
    getFormSubmissions,
    updateStatus,
    getAllSubmissionsAdmin,
    getMySubmissions,
    getSubmissionPublic,

    analyzeReceipt,
    deleteSubmission
} = require('../controllers/submissionController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/submit', submitForm); // Public
router.get('/my-submissions', authMiddleware, getMySubmissions);
router.get('/form/:formId', authMiddleware, getFormSubmissions);
router.get('/all', authMiddleware, adminMiddleware, getAllSubmissionsAdmin);
router.patch('/:id/status', authMiddleware, updateStatus);
router.post('/:submissionId/analyze-receipt', authMiddleware, analyzeReceipt);
router.delete('/:id', authMiddleware, deleteSubmission);
router.get('/:id', getSubmissionPublic); // Public Hub

module.exports = router;
