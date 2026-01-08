const express = require('express');
const router = express.Router();
const { createForm, getMyForms, getFormBySlug, updateForm, deleteForm, getAllFormsAdmin, getFormsByMentor } = require('../controllers/formController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createForm);
router.get('/my-forms', authMiddleware, getMyForms);
router.get('/all', authMiddleware, adminMiddleware, getAllFormsAdmin);
router.get('/mentor/:mentorId', getFormsByMentor); // Public mentor events
router.get('/:slug', getFormBySlug); // Public route
router.put('/:id', authMiddleware, updateForm);
router.delete('/:id', authMiddleware, deleteForm);

module.exports = router;
