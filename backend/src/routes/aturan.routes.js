const express = require('express');
const router = express.Router();
const aturanController = require('../controllers/aturan.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public - untuk proses CF
router.get('/', aturanController.getAll);

// Admin only
router.post('/', authMiddleware, aturanController.create);
router.put('/:id', authMiddleware, aturanController.update);
router.delete('/:id', authMiddleware, aturanController.remove);

module.exports = router;
