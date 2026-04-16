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
router.patch('/finance/:id', personalManagementController.updateTransaction);
router.delete('/finance/:id', personalManagementController.deleteTransaction);

// --- TASKS ---
router.get('/tasks', personalManagementController.getTasks);
router.post('/tasks', personalManagementController.addTask);
router.patch('/tasks/:id/status', personalManagementController.updateTaskStatus);
router.patch('/tasks/:id', personalManagementController.updateTask);
router.delete('/tasks/:id', personalManagementController.deleteTask);

// --- PROJECTS ---
router.get('/projects', personalManagementController.getProjects);
router.post('/projects', personalManagementController.addProject);
router.patch('/projects/:id', personalManagementController.updateProject);
router.delete('/projects/:id', personalManagementController.deleteProject);

// --- CLIENTS ---
router.get('/clients', personalManagementController.getClients);
router.post('/clients', personalManagementController.addClient);
router.patch('/clients/:id', personalManagementController.updateClient);
router.delete('/clients/:id', personalManagementController.deleteClient);

// --- REPORTS ---
router.get('/reports', personalManagementController.getReportData);

// --- AI ASSISTANT ---
router.post('/ai/process', protect, personalManagementController.processAICommand);

module.exports = router;
