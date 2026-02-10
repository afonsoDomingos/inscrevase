const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/active', adController.getActiveAds);
router.post('/:id/view', adController.trackAdImpression);
router.post('/:id/click', adController.trackAdClick);

// Protected routes (authenticated users)
router.post('/request', protect, adController.submitAdRequest);
router.get('/my-ads', protect, adController.getMyAdRequests);

// Admin routes
router.get('/all', protect, adminOnly, adController.getAllAdRequests);
router.put('/:id/status', protect, adminOnly, adController.updateAdStatus);

// Shared routes (owner or admin)
router.put('/:id', protect, adController.updateAdRequest);
router.delete('/:id', protect, adController.deleteAdRequest);
router.put('/:id/toggle', protect, adController.toggleAdStatus);

module.exports = router;
