const express = require('express');
const router = express.Router();
const { register, login, getProfile, getUsers, updateByAdmin, deleteByAdmin } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

// Admin Routes
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateByAdmin);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteByAdmin);

module.exports = router;
