const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

/**
 * PUBLIC
 */
router.get('/', vacancyController.getPublicVacancies);
router.get('/:slug', vacancyController.getVacancyBySlug);
router.post('/apply', vacancyController.submitApplication);

/**
 * ADMIN
 */
router.post('/', authMiddleware, adminMiddleware, vacancyController.createVacancy);
router.get('/admin/all', authMiddleware, adminMiddleware, vacancyController.getAdminVacancies);
router.delete('/:id', authMiddleware, adminMiddleware, vacancyController.deleteVacancy);
router.get('/admin/applications', authMiddleware, adminMiddleware, vacancyController.getApplications);

module.exports = router;
