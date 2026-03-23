const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
router.get('/', bookController.getAllBooks);
router.post('/click/:id', bookController.recordClick); // Public record interest

// Admin only
router.get('/admin', protect, admin, bookController.adminGetAllBooks);
router.post('/', protect, admin, bookController.createBook);
router.put('/:id', protect, admin, bookController.updateBook);
router.delete('/:id', protect, admin, bookController.deleteBook);

module.exports = router;
