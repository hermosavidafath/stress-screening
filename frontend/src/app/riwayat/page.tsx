"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import StressBadge from "@/components/StressBadge";
import api from "@/lib/api";
import { Konsultasi } from "@/lib/types";
import toast from "react-hot-toast";
import {
  History,
  Calendar,
  User,
  BookOpen,
  Loader2,
  Lock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Brain,
} from "lucide-react";
import Link from "next/link";

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<Konsultasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadRiwayat();
  }, []);

  async function loadRiwayat() {
    setLoading(true);
    try {
      // Ambil semua token yang tersimpan di localStorage
      const tokens: string[] = JSON.parse(
        localStorage.getItem("screening_tokens") || "[]"
      );

      if (tokens.length === 0) {
        setHasToken(false);
        setLoading(false);
        return;
      }

      setHasToken(true);

      // Ambil riwayat dari token terbaru (token pertama)
      // Jika ada NIM, backend akan kembalikan semua riwayat NIM tersebut
      const latestToken = tokens[0];
      const res = await api.get("/konsultasi/riwayat", {
        params: { token: latestToken },
      });

      setRiwayat(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error("Riwayat tidak ditemukan");
      } else {
        toast.error("Gagal memuat riwayat");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClearRiwayat() {
    if (!confirm("Hapus semua riwayat dari perangkat ini? Data di server tidak terhapus.")) return;
    localStorage.removeItem("screening_tokens");
    localStorage.removeItem("latest_token");
    setRiwayat([]);
    setHasToken(false);
    toast.success("Riwayat dihapus dari perangkat ini");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Riwayat Screening
          </h1>
          <p className="text-gray-600 mt-1">
            Riwayat screening tersimpan di perangkat ini
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Riwayat hanya bisa dilihat dari perangkat yang digunakan saat screening.
            Data tidak bisa diakses orang lain tanpa token pribadi kamu.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Belum pernah screening */}
        {!loading && !hasToken && (
          <div className="card text-center py-16">
            <Brain className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Belum ada riwayat screening
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Kamu belum pernah melakukan screening dari perangkat ini.
            </p>
            <Link href="/konsultasi" className="btn-primary inline-flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Mulai Screening Sekarang
            </Link>
          </div>
        )}

        {/* Ada token tapi tidak ada data */}
        {!loading && hasToken && riwayat.length === 0 && (
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Riwayat tidak ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">
              Data mungkin sudah dihapus dari server
            </p>
          </div>
        )}

        {/* Daftar Riwayat */}
        {!loading && riwayat.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {riwayat.length} riwayat ditemukan
              </p>
              <button
                onClick={handleClearRiwayat}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Hapus dari perangkat ini
              </button>
            </div>

            <div className="space-y-4">
              {riwayat.map((k) => {
                const gejalas = JSON.parse(k.gejalaTerpilih || "[]");
                const isExpanded = expandedId === k.id;
                const saranList = (k.saran || "")
                  .split("\n")
                  .filter((s) => s.trim());

                return (
                  <div
                    key={k.id}
                    className="card hover:shadow-md transition-shadow"
                  >
                    {/* Header kartu */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {k.nama}
                          </h3>
                          <StressBadge tingkat={k.tingkatStres} />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                          {k.nim && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              NIM: {k.nim}
                            </div>
                          )}
                          {k.jurusan && (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                              {k.jurusan}
                              {k.semester && ` - Sem ${k.semester}`}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(k.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      {/* CF Score */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          {k.persentaseCF?.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">CF</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {gejalas.length} gejala
                        </div>
                      </div>
                    </div>

                    {/* CF Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            k.tingkatStres?.warna === "red"
                              ? "bg-red-500"
                              : k.tingkatStres?.warna === "yellow"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(k.persentaseCF || 0, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Toggle saran */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : k.id)
                      }
                      className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Sembunyikan saran
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Lihat saran penanganan
                        </>
                      )}
                    </button>

                    {isExpanded && saranList.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Rekomendasi Penanganan:
                        </p>
                        <ul className="space-y-1.5">
                          {saranList.map((s, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-blue-400 flex-shrink-0 mt-0.5">
                                •
                              </span>
                              <span>{s.replace(/^[•\-]\s*/, "")}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CTA screening lagi */}
        {!loading && (
          <div className="mt-8 text-center">
            <Link
              href="/konsultasi"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Screening Lagi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
