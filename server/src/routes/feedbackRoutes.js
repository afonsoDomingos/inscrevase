const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/authMiddleware');

// Public route to send feedback (userId optional in controller)
router.post('/', async (req, res, next) => {
    // Optional auth: try to authenticate but don't fail if no token
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return auth(req, res, next);
    }
    next();
}, feedbackController.createFeedback);

// Protected routes
router.get('/my', auth, feedbackController.getFeedbacksForUser);
router.get('/admin/all', auth, feedbackController.getAllFeedbacksAdmin);
router.patch('/:id/status', auth, feedbackController.updateFeedbackStatus);

module.exports = router;
