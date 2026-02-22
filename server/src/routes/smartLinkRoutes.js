const express = require('express');
const router = express.Router();
const smartLinkController = require('../controllers/smartLinkController');
const { authMiddleware } = require('../middleware/authMiddleware');

// CRUD
router.post('/', authMiddleware, smartLinkController.createSmartLink);
router.get('/my', authMiddleware, smartLinkController.getMyLinks);
router.put('/:id', authMiddleware, smartLinkController.updateSmartLink);
router.delete('/:id', authMiddleware, smartLinkController.deleteSmartLink);

// The redirect is usually better outside /api for end-users, 
// but we'll include it here just in case and also export it for the main index.js
router.get('/redirect/:slug', smartLinkController.handleRedirect);

module.exports = router;
