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
router.patch('/admin/status/:id', authMiddleware, adminMiddleware, bookController.updateStatus);
router.put('/:id', authMiddleware, adminMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, bookController.deleteBook);

// User Submission & Library Routes
router.get('/my', authMiddleware, bookController.getMyBooks);
router.post('/submit', authMiddleware, bookController.submitBook);
router.post('/purchase/:id', authMiddleware, bookController.recordPurchase);
router.get('/library', authMiddleware, bookController.getUserPurchasedBooks);

module.exports = router;
