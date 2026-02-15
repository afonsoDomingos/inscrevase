const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware: auth, adminMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');

// Public route to send feedback (userId optional in controller)
router.post('/', optionalAuthMiddleware, feedbackController.createFeedback);

// Protected routes
router.get('/my', auth, feedbackController.getFeedbacksForUser);
router.get('/admin/all', auth, adminMiddleware, feedbackController.getAllFeedbacksAdmin);
router.patch('/:id/status', auth, adminMiddleware, feedbackController.updateFeedbackStatus);

module.exports = router;
