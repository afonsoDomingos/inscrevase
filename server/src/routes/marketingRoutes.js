const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const passport = require('passport');
const { isAdmin } = require('../utils/authMiddleware');

// All routes require authentication
router.use(passport.authenticate('jwt', { session: false }));

// Mentor routes
router.post('/', marketingController.createRequest);
router.get('/my', marketingController.getMyRequests);

// Admin routes
router.get('/all', isAdmin, marketingController.getAllRequests);
router.patch('/:id/status', isAdmin, marketingController.updateStatus);

module.exports = router;
