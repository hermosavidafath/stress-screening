# Sistem Screening Stres Mahasiswa
**Metode: Certainty Factor (CF)**

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Express.js + Prisma ORM
- **Database**: MySQL
- **Auth**: JWT

---

## Cara Menjalankan

### 1. Setup Database
Buat database MySQL:
```sql
CREATE DATABASE stress_screening;
```

### 2. Backend
```bash
cd backend
npm install

# Copy dan isi .env
copy .env.example .env
# Edit DATABASE_URL dan JWT_SECRET di .env

# Push schema ke database
npm run db:generate
npm run db:push

# Seed data awal (gejala, aturan CF, admin)
npm run db:seed

# Jalankan server
npm run dev
```
Server berjalan di: http://localhost:5000

### 3. Frontend
```bash
cd frontend
npm install

# Copy dan isi .env.local
copy .env.local.example .env.local

# Jalankan
npm run dev
```
Frontend berjalan di: http://localhost:3000

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

## Metode CF

**Rumus:**
```
CF_gejala = CF_user × CF_pakar
CF_kombinasi(A,B) = CF(A) + CF(B) × (1 - CF(A))  [jika keduanya positif]
```

**CF User** (keyakinan user):
- Tidak yakin: 0.2
- Sedikit yakin: 0.4
- Cukup yakin: 0.6
- Yakin: 0.8
- Sangat yakin: 1.0

**Kategori Hasil:**
- CF < 40% → Stres Rendah
- CF 40-69% → Stres Sedang
- CF ≥ 70% → Stres Tinggi

---

## Dataset
Dataset: **StressLevelDataset.csv** (Kaggle)
- 22 fitur psikologis, akademik, fisik, sosial
- Label: stress_level (0=Rendah, 1=Sedang, 2=Tinggi)
- Digunakan sebagai basis penentuan bobot CF pakar

---

## Hosting
- **Frontend**: Vercel (gratis) → `vercel deploy`
- **Backend**: Railway / Render (gratis)
- **Database**: PlanetScale (MySQL gratis) / Railway MySQL
