const express = require('express');
const router = express.Router();
const { recordVisit, getAnalyticsStats } = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Rota pública para registrar visita (qualquer um pode chamar)
router.post('/visit', recordVisit);

// Rota protegida para ver estatísticas (só admin)
router.get('/stats', authMiddleware, adminMiddleware, getAnalyticsStats);

// Rota pública de impacto (Home Page)
const { getPublicImpactStats } = require('../controllers/analyticsController');
router.get('/public-impact', getPublicImpactStats);

module.exports = router;
