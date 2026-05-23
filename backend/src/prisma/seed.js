/**
 * Seed Data - Sistem Screening Stres Mahasiswa
 * 
 * Gejala dan bobot CF didasarkan pada:
 * 1. Analisis dataset StressLevelDataset.csv (Kaggle)
 * 2. Literatur psikologi stres mahasiswa
 * 3. Skala PSS (Perceived Stress Scale) & DASS-21
 * 
 * Bobot CF Pakar berdasarkan korelasi fitur dengan stress_level di dataset:
 * - anxiety_level: korelasi tinggi → CF 0.8
 * - depression: korelasi tinggi → CF 0.8
 * - sleep_quality (rendah): korelasi tinggi → CF 0.7
 * - study_load (tinggi): korelasi sedang → CF 0.6
 * - future_career_concerns: korelasi sedang → CF 0.6
 * - peer_pressure: korelasi sedang → CF 0.5
 * - academic_performance (rendah): korelasi sedang → CF 0.6
 * - headache: korelasi sedang → CF 0.5
 * - self_esteem (rendah): korelasi sedang → CF 0.6
 * - social_support (rendah): korelasi sedang → CF 0.5
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding...');

  // ─── Admin ───────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@stresscheck.id' },
    update: {},
    create: {
      nama: 'Administrator',
      email: 'admin@stresscheck.id',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin dibuat: admin@stresscheck.id / admin123');

  // ─── Tingkat Stres ────────────────────────────────────────
  const tingkatData = [
    {
      kode: 'RENDAH',
      nama: 'Stres Rendah',
      deskripsi: 'Tingkat stres dalam batas normal. Mahasiswa mampu mengelola tekanan sehari-hari dengan baik.',
      minCF: 0.0,
      maxCF: 0.39,
      warna: 'green',
      saran: `• Pertahankan pola hidup sehat yang sudah berjalan baik
• Tetap jaga kualitas tidur 7-8 jam per malam
• Lanjutkan aktivitas fisik dan olahraga rutin
• Jaga hubungan sosial yang positif dengan teman dan keluarga
• Manfaatkan waktu luang untuk hobi dan relaksasi
• Tetap kelola waktu belajar dengan baik agar tidak menumpuk`,
    },
    {
      kode: 'SEDANG',
      nama: 'Stres Sedang',
      deskripsi: 'Tingkat stres cukup signifikan. Perlu perhatian dan pengelolaan stres yang lebih baik.',
      minCF: 0.4,
      maxCF: 0.69,
      warna: 'yellow',
      saran: `• Terapkan teknik relaksasi seperti pernapasan dalam atau meditasi 10-15 menit/hari
• Buat jadwal belajar yang terstruktur dan realistis, hindari sistem kebut semalam
• Batasi penggunaan media sosial terutama sebelum tidur
• Ceritakan perasaanmu kepada teman dekat, keluarga, atau konselor kampus
• Lakukan olahraga ringan minimal 30 menit, 3x seminggu (jalan kaki, bersepeda)
• Prioritaskan tugas menggunakan metode Eisenhower Matrix (penting vs mendesak)
• Pertimbangkan untuk berkonsultasi dengan konselor/psikolog kampus`,
    },
    {
      kode: 'TINGGI',
      nama: 'Stres Tinggi',
      deskripsi: 'Tingkat stres sangat tinggi. Memerlukan perhatian serius dan bantuan profesional.',
      minCF: 0.7,
      maxCF: 1.0,
      warna: 'red',
      saran: `• SEGERA konsultasikan kondisimu dengan psikolog atau konselor kampus
• Hubungi layanan kesehatan mental kampus atau Puskesmas terdekat
• Jangan hadapi ini sendirian — ceritakan kepada orang yang kamu percaya
• Kurangi beban akademik sementara jika memungkinkan (diskusi dengan dosen/wali)
• Hindari kafein berlebihan, alkohol, dan begadang
• Praktikkan teknik grounding: 5-4-3-2-1 (5 hal yang dilihat, 4 disentuh, dst)
• Istirahat yang cukup adalah prioritas utama saat ini
• Jika ada pikiran menyakiti diri sendiri, segera hubungi hotline kesehatan mental: 119 ext 8`,
    },
  ];

  const tingkatMap = {};
  for (const t of tingkatData) {
    const ts = await prisma.tingkatStres.upsert({
      where: { kode: t.kode },
      update: t,
      create: t,
    });
    tingkatMap[t.kode] = ts.id;
  }
  console.log('✅ Tingkat stres dibuat');

  // ─── Gejala ───────────────────────────────────────────────
  // Bobot CF berdasarkan analisis korelasi dataset Kaggle
  const gejalaData = [
    // PSIKOLOGIS
    { kode: 'G001', nama: 'Merasa cemas atau khawatir berlebihan', deskripsi: 'Perasaan cemas yang sulit dikendalikan, muncul hampir setiap hari', kategori: 'psikologis', bobot: 0.8 },
    { kode: 'G002', nama: 'Merasa sedih atau tertekan berkepanjangan', deskripsi: 'Perasaan sedih, hampa, atau putus asa yang berlangsung lebih dari 2 minggu', kategori: 'psikologis', bobot: 0.8 },
    { kode: 'G003', nama: 'Kehilangan minat pada hal yang biasanya disukai', deskripsi: 'Tidak lagi menikmati hobi, kegiatan sosial, atau hal-hal yang dulu menyenangkan', kategori: 'psikologis', bobot: 0.7 },
    { kode: 'G004', nama: 'Merasa tidak berharga atau rendah diri', deskripsi: 'Sering merasa tidak mampu, tidak berguna, atau harga diri sangat rendah', kategori: 'psikologis', bobot: 0.6 },
    { kode: 'G005', nama: 'Sulit berkonsentrasi saat belajar', deskripsi: 'Pikiran mudah teralihkan, sulit fokus membaca atau mengerjakan tugas', kategori: 'psikologis', bobot: 0.6 },
    { kode: 'G006', nama: 'Merasa mudah marah atau emosi tidak stabil', deskripsi: 'Mudah tersinggung, marah tanpa sebab jelas, atau perubahan mood yang drastis', kategori: 'psikologis', bobot: 0.5 },
    { kode: 'G007', nama: 'Merasa putus asa tentang masa depan', deskripsi: 'Pesimis terhadap masa depan, merasa tidak ada harapan untuk kondisi membaik', kategori: 'psikologis', bobot: 0.7 },

    // AKADEMIK
    { kode: 'G008', nama: 'Beban tugas dan kuliah terasa sangat berat', deskripsi: 'Merasa kewalahan dengan jumlah tugas, deadline, dan materi kuliah', kategori: 'akademik', bobot: 0.6 },
    { kode: 'G009', nama: 'Performa akademik menurun drastis', deskripsi: 'Nilai turun signifikan, sering tidak mengumpulkan tugas, atau absen kuliah', kategori: 'akademik', bobot: 0.6 },
    { kode: 'G010', nama: 'Sangat khawatir tentang karir dan masa depan', deskripsi: 'Cemas berlebihan soal pekerjaan setelah lulus, takut tidak dapat kerja', kategori: 'akademik', bobot: 0.6 },
    { kode: 'G011', nama: 'Hubungan dengan dosen tidak baik', deskripsi: 'Merasa tidak nyaman, takut, atau konflik dengan dosen/pengajar', kategori: 'akademik', bobot: 0.4 },

    // FISIK
    { kode: 'G012', nama: 'Sering mengalami sakit kepala', deskripsi: 'Sakit kepala yang sering muncul, terutama saat banyak pikiran atau tekanan', kategori: 'fisik', bobot: 0.5 },
    { kode: 'G013', nama: 'Kualitas tidur buruk atau insomnia', deskripsi: 'Sulit tidur, sering terbangun malam, atau tidur terlalu banyak namun tetap lelah', kategori: 'fisik', bobot: 0.7 },
    { kode: 'G014', nama: 'Sering merasa lelah meski sudah cukup istirahat', deskripsi: 'Kelelahan fisik dan mental yang tidak hilang meski sudah tidur', kategori: 'fisik', bobot: 0.5 },
    { kode: 'G015', nama: 'Tekanan darah terasa tinggi atau jantung berdebar', deskripsi: 'Sering merasakan jantung berdebar, sesak napas, atau tekanan di dada', kategori: 'fisik', bobot: 0.5 },
    { kode: 'G016', nama: 'Sering mengalami masalah pernapasan saat stres', deskripsi: 'Napas terasa pendek atau sesak terutama saat menghadapi tekanan', kategori: 'fisik', bobot: 0.4 },

    // SOSIAL & LINGKUNGAN
    { kode: 'G017', nama: 'Kurang dukungan sosial dari orang sekitar', deskripsi: 'Merasa tidak ada yang peduli, tidak punya teman dekat, atau merasa sendirian', kategori: 'sosial', bobot: 0.5 },
    { kode: 'G018', nama: 'Mengalami tekanan dari teman sebaya', deskripsi: 'Merasa ditekan, dibanding-bandingkan, atau dipaksa mengikuti kelompok', kategori: 'sosial', bobot: 0.5 },
    { kode: 'G019', nama: 'Kondisi tempat tinggal tidak nyaman', deskripsi: 'Lingkungan kos/rumah berisik, tidak aman, atau tidak mendukung belajar', kategori: 'sosial', bobot: 0.4 },
    { kode: 'G020', nama: 'Pernah mengalami bullying atau perundungan', deskripsi: 'Pernah atau sedang mengalami perundungan fisik, verbal, atau cyberbullying', kategori: 'sosial', bobot: 0.6 },
    { kode: 'G021', nama: 'Kebutuhan dasar tidak terpenuhi dengan baik', deskripsi: 'Kesulitan memenuhi kebutuhan makan, biaya kuliah, atau kebutuhan pokok lainnya', kategori: 'sosial', bobot: 0.5 },
    { kode: 'G022', nama: 'Memiliki riwayat masalah kesehatan mental sebelumnya', deskripsi: 'Pernah didiagnosis atau ditangani untuk masalah psikologis sebelumnya', kategori: 'psikologis', bobot: 0.6 },
  ];

  const gejalaMap = {};
  for (const g of gejalaData) {
    const gejala = await prisma.gejala.upsert({
      where: { kode: g.kode },
      update: g,
      create: g,
    });
    gejalaMap[g.kode] = gejala.id;
  }
  console.log('✅ Gejala dibuat:', Object.keys(gejalaMap).length, 'gejala');

  // ─── Aturan CF ────────────────────────────────────────────
  /**
   * Aturan dibuat berdasarkan pola dari dataset:
   * - stress_level=0 (Rendah): anxiety rendah, depression rendah, sleep_quality baik
   * - stress_level=1 (Sedang): kombinasi gejala sedang
   * - stress_level=2 (Tinggi): anxiety tinggi, depression tinggi, sleep_quality buruk, study_load tinggi
   */
  const aturanData = [
    // ── STRES RENDAH ──
    {
      kode: 'R001',
      nama: 'Stres Rendah - Kondisi Umum Baik',
      tingkatKode: 'RENDAH',
      cfPakar: 0.4,
      gejalaKodes: ['G005', 'G006'], // hanya gejala ringan
    },

    // ── STRES SEDANG ──
    {
      kode: 'R002',
      nama: 'Stres Sedang - Kecemasan & Beban Akademik',
      tingkatKode: 'SEDANG',
      cfPakar: 0.7,
      gejalaKodes: ['G001', 'G008', 'G010'],
    },
    {
      kode: 'R003',
      nama: 'Stres Sedang - Gangguan Tidur & Konsentrasi',
      tingkatKode: 'SEDANG',
      cfPakar: 0.65,
      gejalaKodes: ['G013', 'G005', 'G012'],
    },
    {
      kode: 'R004',
      nama: 'Stres Sedang - Tekanan Sosial & Performa',
      tingkatKode: 'SEDANG',
      cfPakar: 0.6,
      gejalaKodes: ['G018', 'G009', 'G004'],
    },
    {
      kode: 'R005',
      nama: 'Stres Sedang - Fisik & Psikologis',
      tingkatKode: 'SEDANG',
      cfPakar: 0.6,
      gejalaKodes: ['G012', 'G014', 'G006', 'G001'],
    },
    {
      kode: 'R006',
      nama: 'Stres Sedang - Kurang Dukungan Sosial',
      tingkatKode: 'SEDANG',
      cfPakar: 0.55,
      gejalaKodes: ['G017', 'G003', 'G004'],
    },

    // ── STRES TINGGI ──
    {
      kode: 'R007',
      nama: 'Stres Tinggi - Kecemasan & Depresi Berat',
      tingkatKode: 'TINGGI',
      cfPakar: 0.9,
      gejalaKodes: ['G001', 'G002', 'G007', 'G013'],
    },
    {
      kode: 'R008',
      nama: 'Stres Tinggi - Beban Akademik Ekstrem',
      tingkatKode: 'TINGGI',
      cfPakar: 0.85,
      gejalaKodes: ['G008', 'G009', 'G010', 'G001', 'G013'],
    },
    {
      kode: 'R009',
      nama: 'Stres Tinggi - Gangguan Psikologis Multipel',
      tingkatKode: 'TINGGI',
      cfPakar: 0.85,
      gejalaKodes: ['G002', 'G003', 'G004', 'G007', 'G022'],
    },
    {
      kode: 'R010',
      nama: 'Stres Tinggi - Fisik & Mental Terganggu',
      tingkatKode: 'TINGGI',
      cfPakar: 0.8,
      gejalaKodes: ['G013', 'G015', 'G016', 'G001', 'G002'],
    },
    {
      kode: 'R011',
      nama: 'Stres Tinggi - Isolasi Sosial & Depresi',
      tingkatKode: 'TINGGI',
      cfPakar: 0.8,
      gejalaKodes: ['G017', 'G002', 'G003', 'G007'],
    },
    {
      kode: 'R012',
      nama: 'Stres Tinggi - Bullying & Tekanan Lingkungan',
      tingkatKode: 'TINGGI',
      cfPakar: 0.75,
      gejalaKodes: ['G020', 'G018', 'G002', 'G004'],
    },
    {
      kode: 'R013',
      nama: 'Stres Tinggi - Riwayat Mental & Gejala Berat',
      tingkatKode: 'TINGGI',
      cfPakar: 0.85,
      gejalaKodes: ['G022', 'G001', 'G002', 'G013', 'G007'],
    },
  ];

  for (const a of aturanData) {
    const existing = await prisma.aturan.findUnique({ where: { kode: a.kode } });
    if (existing) {
      await prisma.aturanGejala.deleteMany({ where: { aturanId: existing.id } });
      await prisma.aturan.update({
        where: { kode: a.kode },
        data: {
          nama: a.nama,
          tingkatStresId: tingkatMap[a.tingkatKode],
          cfPakar: a.cfPakar,
          aturanGejala: {
            create: a.gejalaKodes.map(kode => ({ gejalaId: gejalaMap[kode] })),
          },
        },
      });
    } else {
      await prisma.aturan.create({
        data: {
          kode: a.kode,
          nama: a.nama,
          tingkatStresId: tingkatMap[a.tingkatKode],
          cfPakar: a.cfPakar,
          aturanGejala: {
            create: a.gejalaKodes.map(kode => ({ gejalaId: gejalaMap[kode] })),
          },
        },
      });
    }
  }
  console.log('✅ Aturan CF dibuat:', aturanData.length, 'aturan');

  console.log('\n🎉 Seeding selesai!');
  console.log('📧 Login admin: admin@stresscheck.id');
  console.log('🔑 Password: admin123');
}

main()
  .catch(e => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
