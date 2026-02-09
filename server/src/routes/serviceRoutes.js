const { Router } = require('express');
const { authMiddleware: protect } = require('../middleware/authMiddleware');
const serviceController = require('../controllers/serviceController');

const router = Router();

// Public routes
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.post('/:id/inquiry', serviceController.incrementInquiry);

// Protected routes
router.post('/', protect, serviceController.createService);
router.get('/my/services', protect, serviceController.getMyServices);
router.put('/:id', protect, serviceController.updateService);
router.delete('/:id', protect, serviceController.deleteService);
router.patch('/:id/toggle-status', protect, serviceController.toggleServiceStatus);

module.exports = router;
