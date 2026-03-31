const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const { authMiddleware, adminMiddleware, recruiterMiddleware } = require('../middleware/authMiddleware');

/**
 * PUBLIC
 */
router.get('/', vacancyController.getPublicVacancies);
router.get('/:slug', vacancyController.getVacancyBySlug);
router.post('/apply', vacancyController.submitApplication);

/**
 * ADMIN
 */
router.post('/', authMiddleware, recruiterMiddleware, vacancyController.createVacancy);
router.put('/:id', authMiddleware, recruiterMiddleware, vacancyController.updateVacancy);
router.get('/admin/all', authMiddleware, recruiterMiddleware, vacancyController.getAdminVacancies);
router.delete('/:id', authMiddleware, recruiterMiddleware, vacancyController.deleteVacancy);
router.get('/admin/applications', authMiddleware, recruiterMiddleware, vacancyController.getApplications);

module.exports = router;
