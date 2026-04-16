const express = require('express');
const router = express.Router();
const personalManagementController = require('../controllers/personalManagementController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Require authentication for all routes in this module
router.use(authMiddleware);

// --- FINANCE ---
router.get('/finance/summary', personalManagementController.getFinanceSummary);
router.get('/finance', personalManagementController.getTransactions);
router.post('/finance', personalManagementController.addTransaction);
router.delete('/finance/:id', personalManagementController.deleteTransaction);

// --- TASKS ---
router.get('/tasks', personalManagementController.getTasks);
router.post('/tasks', personalManagementController.addTask);
router.patch('/tasks/:id', personalManagementController.updateTaskStatus);
router.delete('/tasks/:id', personalManagementController.deleteTask);

// --- PROJECTS ---
router.get('/projects', personalManagementController.getProjects);
router.post('/projects', personalManagementController.addProject);

module.exports = router;
