const express = require('express');
const router = express.Router();
const smartLinkController = require('../controllers/smartLinkController');
const { authMiddleware } = require('../middleware/authMiddleware');

// CRUD
router.post('/', authMiddleware, smartLinkController.createSmartLink);
router.get('/my', authMiddleware, smartLinkController.getMyLinks);
router.put('/:id', authMiddleware, smartLinkController.updateSmartLink);
router.delete('/:id', authMiddleware, smartLinkController.deleteSmartLink);

// Public routes
router.get('/info/:slug', smartLinkController.getLinkBySlug);
router.get('/redirect/:slug', smartLinkController.handleRedirect);

// Admin routes
const { adminMiddleware } = require('../middleware/authMiddleware');
router.get('/admin/all', authMiddleware, adminMiddleware, smartLinkController.getAllLinksForAdmin);
router.post('/admin/audit/:id', authMiddleware, adminMiddleware, smartLinkController.toggleBanSmartLink);

module.exports = router;
