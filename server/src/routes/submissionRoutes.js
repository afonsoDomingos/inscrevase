const express = require('express');
const router = express.Router();
const {
    submitForm,
    getFormSubmissions,
    updateStatus,
    bulkUpdateSubmissions,
    getAllSubmissionsAdmin,
    getMySubmissions,
    getSubmissionPublic,

    analyzeReceipt,
    deleteSubmission,
    requestCertificate,
    updateCertificateStatus
} = require('../controllers/submissionController');
const { authMiddleware, adminMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.post('/submit', optionalAuthMiddleware, submitForm); // Optional Auth for linking users
router.get('/my-submissions', authMiddleware, getMySubmissions);
router.get('/form/:formId', authMiddleware, getFormSubmissions);
router.get('/all', authMiddleware, adminMiddleware, getAllSubmissionsAdmin);
router.patch('/:id/status', authMiddleware, updateStatus);
router.post('/bulk-update', authMiddleware, bulkUpdateSubmissions);
router.post('/:submissionId/analyze-receipt', authMiddleware, analyzeReceipt);
router.delete('/:id', authMiddleware, deleteSubmission);
router.post('/:id/request-certificate', authMiddleware, requestCertificate);
router.patch('/:id/certificate-status', authMiddleware, updateCertificateStatus);
router.get('/:id', getSubmissionPublic); // Public Hub

module.exports = router;
