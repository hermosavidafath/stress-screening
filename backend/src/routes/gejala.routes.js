const express = require('express');
const router = express.Router();
const gejalaController = require('../controllers/gejala.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public - untuk form kuesioner
router.get('/', gejalaController.getAll);
router.get('/:id', gejalaController.getById);

// Admin only
router.post('/', authMiddleware, gejalaController.create);
router.put('/:id', authMiddleware, gejalaController.update);
router.delete('/:id', authMiddleware, gejalaController.remove);

module.exports = router;
