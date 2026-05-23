const prisma = require('../lib/prisma');

const aturanController = {
  async getAll(req, res) {
    try {
      const aturans = await prisma.aturan.findMany({
        where: { aktif: true },
        include: {
          tingkatStres: true,
          aturanGejala: {
            include: { gejala: true },
          },
        },
        orderBy: { kode: 'asc' },
      });
      res.json({ success: true, data: aturans });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async create(req, res) {
    try {
      const { kode, nama, tingkatStresId, cfPakar, gejalaIds } = req.body;
      if (!kode || !nama || !tingkatStresId || cfPakar === undefined || !gejalaIds?.length) {
        return res.status(400).json({ success: false, message: 'Field wajib tidak lengkap' });
      }

      const aturan = await prisma.aturan.create({
        data: {
          kode,
          nama,
          tingkatStresId: parseInt(tingkatStresId),
          cfPakar: parseFloat(cfPakar),
          aturanGejala: {
            create: gejalaIds.map(id => ({ gejalaId: parseInt(id) })),
          },
        },
        include: {
          tingkatStres: true,
          aturanGejala: { include: { gejala: true } },
        },
      });
      res.status(201).json({ success: true, message: 'Aturan berhasil ditambahkan', data: aturan });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Kode aturan sudah ada' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async update(req, res) {
    try {
      const { nama, tingkatStresId, cfPakar, aktif, gejalaIds } = req.body;
      const id = parseInt(req.params.id);

      await prisma.aturan.update({
        where: { id },
        data: {
          ...(nama && { nama }),
          ...(tingkatStresId && { tingkatStresId: parseInt(tingkatStresId) }),
          ...(cfPakar !== undefined && { cfPakar: parseFloat(cfPakar) }),
          ...(aktif !== undefined && { aktif }),
        },
      });

      // Update gejala jika diberikan
      if (gejalaIds?.length) {
        await prisma.aturanGejala.deleteMany({ where: { aturanId: id } });
        await prisma.aturanGejala.createMany({
          data: gejalaIds.map(gid => ({ aturanId: id, gejalaId: parseInt(gid) })),
        });
      }

      const updated = await prisma.aturan.findUnique({
        where: { id },
        include: { tingkatStres: true, aturanGejala: { include: { gejala: true } } },
      });

      res.json({ success: true, message: 'Aturan berhasil diupdate', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async remove(req, res) {
    try {
      await prisma.aturan.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ success: true, message: 'Aturan berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = aturanController;
