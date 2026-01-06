const express = require('express');
const router = express.Router();
const { createForm, getMyForms, getFormBySlug, updateForm, deleteForm } = require('../controllers/formController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createForm);
router.get('/my-forms', authMiddleware, getMyForms);
router.get('/:slug', getFormBySlug); // Public route
router.put('/:id', authMiddleware, updateForm);
router.delete('/:id', authMiddleware, deleteForm);

module.exports = router;
