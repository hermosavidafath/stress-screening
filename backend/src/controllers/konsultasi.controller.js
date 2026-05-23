const prisma = require('../lib/prisma');
const { hitungCFTotal, tentukanHasil } = require('../lib/cfEngine');
const crypto = require('crypto');

const konsultasiController = {
  async create(req, res) {
    try {
      const { nama, nim, email, umur, semester, jurusan, gejalaTerpilih } = req.body;

      if (!nama || !gejalaTerpilih?.length) {
        return res.status(400).json({ success: false, message: 'Nama dan gejala wajib diisi' });
      }

      const aturans = await prisma.aturan.findMany({
        where: { aktif: true },
        include: { aturanGejala: { include: { gejala: true } } },
      });

      const tingkatStresList = await prisma.tingkatStres.findMany();

      if (!aturans.length) {
        return res.status(400).json({ success: false, message: 'Belum ada aturan CF yang dikonfigurasi' });
      }

      const { cfPerTingkat } = hitungCFTotal(gejalaTerpilih, aturans);
      const hasil = tentukanHasil(cfPerTingkat, tingkatStresList);

      // Generate token unik untuk akses riwayat pribadi
      const accessToken = crypto.randomBytes(32).toString('hex');

      const konsultasi = await prisma.konsultasi.create({
        data: {
          nama,
          nim: nim || null,
          email: email || null,
          umur: umur ? parseInt(umur) : null,
          semester: semester ? parseInt(semester) : null,
          jurusan: jurusan || null,
          tingkatStresId: hasil.tingkatStres?.id || null,
          nilaiCF: hasil.nilaiCF,
          persentaseCF: hasil.persentaseCF,
          gejalaTerpilih: JSON.stringify(gejalaTerpilih),
          saran: hasil.tingkatStres?.saran || null,
          accessToken,
        },
        include: { tingkatStres: true },
      });

      res.status(201).json({
        success: true,
        message: 'Screening berhasil',
        data: {
          konsultasi,
          accessToken, // dikirim ke frontend, disimpan di localStorage
          hasil: {
            tingkatStres: hasil.tingkatStres,
            nilaiCF: hasil.nilaiCF,
            persentaseCF: hasil.persentaseCF,
            cfPerTingkat: hasil.cfPerTingkat,
          },
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Riwayat hanya bisa diakses dengan accessToken yang valid
  async getRiwayatByToken(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
      }

      // Cari konsultasi berdasarkan token
      const konsultasi = await prisma.konsultasi.findUnique({
        where: { accessToken: token },
        include: { tingkatStres: true },
      });

      if (!konsultasi) {
        return res.status(404).json({ success: false, message: 'Data tidak ditemukan atau token tidak valid' });
      }

      // Ambil semua riwayat milik NIM yang sama (jika ada NIM)
      // atau hanya konsultasi ini saja
      let riwayat = [konsultasi];
      if (konsultasi.nim) {
        riwayat = await prisma.konsultasi.findMany({
          where: { nim: konsultasi.nim },
          include: { tingkatStres: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        // Hapus accessToken dari response untuk keamanan
        riwayat = riwayat.map(({ accessToken, ...rest }) => rest);
      } else {
        riwayat = [{ ...konsultasi, accessToken: undefined }];
      }

      res.json({ success: true, data: riwayat });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, tingkat, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (tingkat) {
        const ts = await prisma.tingkatStres.findFirst({ where: { kode: tingkat } });
        if (ts) where.tingkatStresId = ts.id;
      }
      if (search) {
        where.OR = [
          { nama: { contains: search } },
          { nim: { contains: search } },
        ];
      }

      const [total, data] = await Promise.all([
        prisma.konsultasi.count({ where }),
        prisma.konsultasi.findMany({
          where,
          include: { tingkatStres: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
      ]);

      res.json({
        success: true,
        data,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getStresBerat(req, res) {
    try {
      const tinggiTs = await prisma.tingkatStres.findFirst({ where: { kode: 'TINGGI' } });
      if (!tinggiTs) return res.json({ success: true, data: [] });

      const data = await prisma.konsultasi.findMany({
        where: { tingkatStresId: tinggiTs.id },
        include: { tingkatStres: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getById(req, res) {
    try {
      const konsultasi = await prisma.konsultasi.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { tingkatStres: true },
      });
      if (!konsultasi) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
      res.json({ success: true, data: konsultasi });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async remove(req, res) {
    try {
      await prisma.konsultasi.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = konsultasiController;
