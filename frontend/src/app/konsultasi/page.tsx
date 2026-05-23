"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Gejala, GejalaInput, CF_USER_OPTIONS, KATEGORI_LABELS } from "@/lib/types";
import toast from "react-hot-toast";
import { Brain, ChevronRight, Info, Loader2 } from "lucide-react";
import clsx from "clsx";

interface FormData {
  nama: string;
  nim: string;
  email: string;
  umur: string;
  semester: string;
  jurusan: string;
}

export default function KonsultasiPage() {
  const router = useRouter();
  const [step, setStep] = useState<"identitas" | "gejala" | "loading">("identitas");
  const [formData, setFormData] = useState<FormData>({
    nama: "", nim: "", email: "", umur: "", semester: "", jurusan: "",
  });
  const [gejalas, setGejalas] = useState<Gejala[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({}); // gejalaId -> cfUser
  const [loadingGejalas, setLoadingGejalas] = useState(false);

  useEffect(() => {
    fetchGejalas();
  }, []);

  async function fetchGejalas() {
    setLoadingGejalas(true);
    try {
      const res = await api.get("/gejala?aktif=true");
      setGejalas(res.data.data);
    } catch {
      toast.error("Gagal memuat daftar gejala");
    } finally {
      setLoadingGejalas(false);
    }
  }

  function handleIdentitasSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.nama.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setStep("gejala");
  }

  function toggleGejala(gejalaId: number) {
    setSelected(prev => {
      const next = { ...prev };
      if (next[gejalaId] !== undefined) {
        delete next[gejalaId];
      } else {
        next[gejalaId] = 0.8; // default: yakin
      }
      return next;
    });
  }

  function setCFUser(gejalaId: number, cfUser: number) {
    setSelected(prev => ({ ...prev, [gejalaId]: cfUser }));
  }

  async function handleSubmit() {
    const gejalaTerpilih: GejalaInput[] = Object.entries(selected).map(
      ([id, cf]) => ({ gejalaId: parseInt(id), cfUser: cf })
    );

    if (gejalaTerpilih.length === 0) {
      toast.error("Pilih minimal 1 gejala yang kamu rasakan");
      return;
    }

    setStep("loading");
    try {
      const res = await api.post("/konsultasi", {
        ...formData,
        umur: formData.umur ? parseInt(formData.umur) : undefined,
        semester: formData.semester ? parseInt(formData.semester) : undefined,
        gejalaTerpilih,
      });

      const { konsultasi, hasil, accessToken } = res.data.data;

      // Simpan accessToken di localStorage untuk akses riwayat
      if (accessToken) {
        const existingTokens: string[] = JSON.parse(
          localStorage.getItem("screening_tokens") || "[]"
        );
        existingTokens.unshift(accessToken);
        // Simpan max 10 token terakhir
        localStorage.setItem(
          "screening_tokens",
          JSON.stringify(existingTokens.slice(0, 10))
        );
        // Simpan token terbaru untuk redirect langsung ke riwayat
        localStorage.setItem("latest_token", accessToken);
      }

      // Simpan hasil ke sessionStorage untuk halaman hasil
      sessionStorage.setItem("hasil_screening", JSON.stringify({ konsultasi, hasil }));
      router.push(`/hasil/${konsultasi.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memproses screening");
      setStep("gejala");
    }
  }

  // Group gejala by kategori
  const gejalaByKategori = gejalas.reduce<Record<string, Gejala[]>>((acc, g) => {
    if (!acc[g.kategori]) acc[g.kategori] = [];
    acc[g.kategori].push(g);
    return acc;
  }, {});

  const selectedCount = Object.keys(selected).length;

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Memproses hasil screening...</p>
          <p className="text-sm text-gray-400">Menghitung Certainty Factor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className={clsx("font-medium", step === "identitas" ? "text-blue-600" : "text-gray-400")}>
              1. Data Diri
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className={clsx("font-medium", step === "gejala" ? "text-blue-600" : "text-gray-400")}>
              2. Pilih Gejala
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Screening Tingkat Stres</h1>
          <p className="text-gray-600 mt-1">
            {step === "identitas"
              ? "Isi data diri kamu terlebih dahulu"
              : "Pilih gejala yang kamu rasakan dan tentukan tingkat keyakinanmu"}
          </p>
        </div>

        {/* Step 1: Identitas */}
        {step === "identitas" && (
          <form onSubmit={handleIdentitasSubmit} className="card space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  className="input"
                  placeholder="Nama kamu"
                  value={formData.nama}
                  onChange={e => setFormData(p => ({ ...p, nama: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">NIM</label>
                <input
                  className="input"
                  placeholder="Nomor Induk Mahasiswa"
                  value={formData.nim}
                  onChange={e => setFormData(p => ({ ...p, nim: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="email@kampus.ac.id"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Umur</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Umur"
                  min={17}
                  max={35}
                  value={formData.umur}
                  onChange={e => setFormData(p => ({ ...p, umur: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Semester</label>
                <select
                  className="input"
                  value={formData.semester}
                  onChange={e => setFormData(p => ({ ...p, semester: e.target.value }))}
                >
                  <option value="">Pilih semester</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Jurusan/Prodi</label>
                <input
                  className="input"
                  placeholder="Jurusan kamu"
                  value={formData.jurusan}
                  onChange={e => setFormData(p => ({ ...p, jurusan: e.target.value }))}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Data yang kamu isi bersifat rahasia dan hanya digunakan untuk keperluan screening.
                NIM digunakan untuk melihat riwayat konsultasi.
              </p>
            </div>

            <button type="submit" className="btn-primary w-full">
              Lanjut ke Pilih Gejala →
            </button>
          </form>
        )}

        {/* Step 2: Pilih Gejala */}
        {step === "gejala" && (
          <div className="space-y-6">
            {/* Info CF */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Cara mengisi:</p>
                <p>Centang gejala yang kamu rasakan, lalu pilih seberapa yakin kamu merasakannya.
                Semakin banyak gejala yang dipilih dengan keyakinan tinggi, semakin akurat hasilnya.</p>
              </div>
            </div>

            {loadingGejalas ? (
              <div className="card flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              Object.entries(gejalaByKategori).map(([kategori, items]) => (
                <div key={kategori} className="card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    {KATEGORI_LABELS[kategori] || kategori}
                  </h3>
                  <div className="space-y-3">
                    {items.map(gejala => {
                      const isSelected = selected[gejala.id] !== undefined;
                      return (
                        <div
                          key={gejala.id}
                          className={clsx(
                            "border rounded-lg p-4 transition-all cursor-pointer",
                            isSelected
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div
                            className="flex items-start gap-3"
                            onClick={() => toggleGejala(gejala.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleGejala(gejala.id)}
                              className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer"
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{gejala.nama}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{gejala.deskripsi}</p>
                            </div>
                          </div>

                          {/* CF User selector */}
                          {isSelected && (
                            <div className="mt-3 ml-7">
                              <p className="text-xs text-gray-600 mb-2 font-medium">
                                Seberapa yakin kamu merasakan ini?
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {CF_USER_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setCFUser(gejala.id, opt.value)}
                                    className={clsx(
                                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                      selected[gejala.id] === opt.value
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Submit */}
            <div className="card flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedCount} gejala dipilih
                </p>
                <p className="text-xs text-gray-500">
                  {selectedCount === 0 ? "Pilih minimal 1 gejala" : "Siap untuk diproses"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("identitas")}
                  className="btn-secondary"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedCount === 0}
                  className="btn-primary flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Proses Screening
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
