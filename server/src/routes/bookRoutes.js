const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public
router.get('/', bookController.getAllBooks);
router.post('/click/:id', bookController.recordClick); // Public record interest

// Admin only
router.get('/admin', authMiddleware, adminMiddleware, bookController.adminGetAllBooks);
router.post('/', authMiddleware, adminMiddleware, bookController.createBook);
router.put('/:id', authMiddleware, adminMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, bookController.deleteBook);

module.exports = router;
