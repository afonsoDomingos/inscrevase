const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Mentor routes
router.post('/', marketingController.createRequest);
router.get('/my', marketingController.getMyRequests);

// Admin routes
router.get('/all', adminMiddleware, marketingController.getAllRequests);
router.patch('/:id/status', adminMiddleware, marketingController.updateStatus);

module.exports = router;
