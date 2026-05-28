# Sistem Pakar Screening Stres Mahasiswa Dengan Metode Certainty Factor

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Express.js + Prisma ORM
- **Database**: MySQL
- **Auth**: JWT

---

## Login Admin
- **Email**: admin@stresscheck.id
- **Password**: admin123

---

## Fitur
| Halaman | Akses | Deskripsi |
|---|---|---|
| `/` | Public | Landing page |
| `/konsultasi` | Public | Form screening (2 step) |
| `/hasil/[id]` | Public | Hasil + CF + saran |
| `/riwayat` | Public (token-based) | Riwayat screening milik sendiri |
| `/admin/login` | - | Login admin |
| `/admin/dashboard` | Admin | Statistik + grafik |
| `/admin/gejala` | Admin | CRUD gejala |
| `/admin/aturan` | Admin | CRUD aturan CF |
| `/admin/konsultasi` | Admin | Data semua konsultasi |
| `/admin/stres-berat` | Admin | Mahasiswa stres tinggi |

---
## Dataset
Dataset: **StressLevelDataset.csv** (Kaggle)
- 22 fitur psikologis, akademik, fisik, sosial
- Label: stress_level (0=Rendah, 1=Sedang, 2=Tinggi)
- Digunakan sebagai basis penentuan bobot CF pakar

---

## Hosting
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway MySQL
