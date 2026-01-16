const express = require('express');
const router = express.Router();
const { recordVisit, getAnalyticsStats } = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Rota pública para registrar visita (qualquer um pode chamar)
router.post('/visit', recordVisit);

// Rota protegida para ver estatísticas (só admin)
router.get('/stats', authMiddleware, adminMiddleware, getAnalyticsStats);

module.exports = router;
