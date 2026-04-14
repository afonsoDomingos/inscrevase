const express = require('express');
const router = express.Router();
const motivaController = require('../controllers/motivaController');
const { protect, adminOnly: admin, optionalAuthMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/active', motivaController.getActiveContest);
router.get('/entries/:phase', motivaController.getEntries);
router.get('/winners', motivaController.getHistoricalWinners);

// User routes (Logged in or Optional for Upload)
router.post('/upload', optionalAuthMiddleware, motivaController.uploadEntry);
router.post('/like/:entryId', protect, motivaController.toggleLike);

// Admin routes
router.get('/admin/entries', protect, admin, motivaController.adminGetAllEntries);
router.get('/admin/phases', protect, admin, motivaController.adminGetAllPhases);
router.post('/admin/phase', protect, admin, motivaController.adminCreatePhase);
router.put('/admin/entry/:entryId', protect, admin, motivaController.adminUpdateEntryStatus);
router.post('/admin/winner', protect, admin, motivaController.adminSetWinner);

module.exports = router;
