const express = require('express');
const router = express.Router();
const konsultasiController = require('../controllers/konsultasi.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public - user submit konsultasi
router.post('/', konsultasiController.create);
// Riwayat hanya bisa diakses dengan accessToken pribadi
router.get('/riwayat', konsultasiController.getRiwayatByToken);

// Admin only
router.get('/', authMiddleware, konsultasiController.getAll);
router.get('/stres-berat', authMiddleware, konsultasiController.getStresBerat);
router.get('/:id', authMiddleware, konsultasiController.getById);
router.delete('/:id', authMiddleware, konsultasiController.remove);

module.exports = router;
