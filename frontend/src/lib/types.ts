export interface TingkatStres {
  id: number;
  kode: "RENDAH" | "SEDANG" | "TINGGI";
  nama: string;
  deskripsi: string;
  warna: string;
  saran: string;
}

export interface Gejala {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string;
  kategori: "psikologis" | "akademik" | "fisik" | "sosial";
  bobot: number;
  aktif: boolean;
}

export interface Aturan {
  id: number;
  kode: string;
  nama: string;
  cfPakar: number;
  aktif: boolean;
  tingkatStres: TingkatStres;
  aturanGejala: { gejala: Gejala }[];
}

export interface Konsultasi {
  id: number;
  nama: string;
  nim?: string;
  email?: string;
  umur?: number;
  semester?: number;
  jurusan?: string;
  tingkatStresId?: number;
  nilaiCF?: number;
  persentaseCF?: number;
  gejalaTerpilih: string;
  saran?: string;
  createdAt: string;
  tingkatStres?: TingkatStres;
}

export interface HasilScreening {
  tingkatStres: TingkatStres;
  nilaiCF: number;
  persentaseCF: number;
  cfPerTingkat: Record<string, number>;
}

export interface GejalaInput {
  gejalaId: number;
  cfUser: number;
}

// CF User options (keyakinan user terhadap gejala)
export const CF_USER_OPTIONS = [
  { label: "Tidak yakin", value: 0.2 },
  { label: "Sedikit yakin", value: 0.4 },
  { label: "Cukup yakin", value: 0.6 },
  { label: "Yakin", value: 0.8 },
  { label: "Sangat yakin", value: 1.0 },
];

export const KATEGORI_LABELS: Record<string, string> = {
  psikologis: "Psikologis",
  akademik: "Akademik",
  fisik: "Fisik",
  sosial: "Sosial & Lingkungan",
};
