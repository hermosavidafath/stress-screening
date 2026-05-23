const prisma = require('../lib/prisma');

const gejalaController = {
  async getAll(req, res) {
    try {
      const { kategori, aktif } = req.query;
      const where = {};
      if (kategori) where.kategori = kategori;
      if (aktif !== undefined) where.aktif = aktif === 'true';

      const gejalas = await prisma.gejala.findMany({
        where,
        orderBy: [{ kategori: 'asc' }, { kode: 'asc' }],
      });
      res.json({ success: true, data: gejalas });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getById(req, res) {
    try {
      const gejala = await prisma.gejala.findUnique({
        where: { id: parseInt(req.params.id) },
      });
      if (!gejala) return res.status(404).json({ success: false, message: 'Gejala tidak ditemukan' });
      res.json({ success: true, data: gejala });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async create(req, res) {
    try {
      const { kode, nama, deskripsi, kategori, bobot } = req.body;
      if (!kode || !nama || !kategori || bobot === undefined) {
        return res.status(400).json({ success: false, message: 'Field wajib tidak lengkap' });
      }

      const gejala = await prisma.gejala.create({
        data: { kode, nama, deskripsi: deskripsi || '', kategori, bobot: parseFloat(bobot) },
      });
      res.status(201).json({ success: true, message: 'Gejala berhasil ditambahkan', data: gejala });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Kode gejala sudah ada' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async update(req, res) {
    try {
      const { nama, deskripsi, kategori, bobot, aktif } = req.body;
      const gejala = await prisma.gejala.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...(nama && { nama }),
          ...(deskripsi !== undefined && { deskripsi }),
          ...(kategori && { kategori }),
          ...(bobot !== undefined && { bobot: parseFloat(bobot) }),
          ...(aktif !== undefined && { aktif }),
        },
      });
      res.json({ success: true, message: 'Gejala berhasil diupdate', data: gejala });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async remove(req, res) {
    try {
      await prisma.gejala.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ success: true, message: 'Gejala berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = gejalaController;
