const prisma = require('../lib/prisma');

const dashboardController = {
  async getStats(req, res) {
    try {
      const [totalKonsultasi, totalGejala, totalAturan, tingkatList] = await Promise.all([
        prisma.konsultasi.count(),
        prisma.gejala.count({ where: { aktif: true } }),
        prisma.aturan.count({ where: { aktif: true } }),
        prisma.tingkatStres.findMany({
          include: { _count: { select: { konsultasi: true } } },
        }),
      ]);

      const distribusi = tingkatList.map(t => ({
        kode: t.kode,
        nama: t.nama,
        warna: t.warna,
        jumlah: t._count.konsultasi,
        persentase: totalKonsultasi > 0
          ? parseFloat(((t._count.konsultasi / totalKonsultasi) * 100).toFixed(1))
          : 0,
      }));

      // Mahasiswa stres tinggi
      const tinggiTs = tingkatList.find(t => t.kode === 'TINGGI');
      const stresBerat = tinggiTs?._count?.konsultasi || 0;

      res.json({
        success: true,
        data: {
          totalKonsultasi,
          totalGejala,
          totalAturan,
          stresBerat,
          distribusi,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getDistribusi(req, res) {
    try {
      const tingkatList = await prisma.tingkatStres.findMany({
        include: { _count: { select: { konsultasi: true } } },
      });

      res.json({
        success: true,
        data: tingkatList.map(t => ({
          kode: t.kode,
          nama: t.nama,
          warna: t.warna,
          jumlah: t._count.konsultasi,
        })),
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getTren(req, res) {
    try {
      // Tren 7 hari terakhir
      const tujuhHariLalu = new Date();
      tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);

      const konsultasiTren = await prisma.konsultasi.findMany({
        where: { createdAt: { gte: tujuhHariLalu } },
        select: { createdAt: true, tingkatStresId: true },
        orderBy: { createdAt: 'asc' },
      });

      // Group by tanggal
      const trenMap = {};
      for (const k of konsultasiTren) {
        const tanggal = k.createdAt.toISOString().split('T')[0];
        if (!trenMap[tanggal]) trenMap[tanggal] = 0;
        trenMap[tanggal]++;
      }

      const tren = Object.entries(trenMap).map(([tanggal, jumlah]) => ({ tanggal, jumlah }));

      res.json({ success: true, data: tren });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = dashboardController;
