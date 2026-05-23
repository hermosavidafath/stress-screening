const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/stats', authMiddleware, dashboardController.getStats);
router.get('/distribusi', authMiddleware, dashboardController.getDistribusi);
router.get('/tren', authMiddleware, dashboardController.getTren);

module.exports = router;
