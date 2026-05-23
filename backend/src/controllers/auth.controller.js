const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
      }

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, nama: admin.nama, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          admin: { id: admin.id, nama: admin.nama, email: admin.email, role: admin.role },
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getMe(req, res) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.id },
        select: { id: true, nama: true, email: true, role: true, createdAt: true },
      });
      res.json({ success: true, data: admin });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async register(req, res) {
    try {
      const { nama, email, password } = req.body;

      const existing = await prisma.admin.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await prisma.admin.create({
        data: { nama, email, password: hashedPassword },
        select: { id: true, nama: true, email: true, role: true },
      });

      res.status(201).json({ success: true, message: 'Admin berhasil dibuat', data: admin });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = authController;
