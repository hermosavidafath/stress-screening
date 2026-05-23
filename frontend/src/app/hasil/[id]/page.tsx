"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StressBadge from "@/components/StressBadge";
import { Konsultasi, HasilScreening } from "@/lib/types";
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, RotateCcw, History } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface HasilData {
  konsultasi: Konsultasi;
  hasil: HasilScreening;
}

export default function HasilPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<HasilData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("hasil_screening");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.konsultasi.id === parseInt(params.id as string)) {
        setData(parsed);
        return;
      }
    }
    // Jika tidak ada di session, redirect ke home
    router.push("/");
  }, [params.id, router]);

  if (!data) return null;

  const { konsultasi, hasil } = data;
  const tingkat = hasil.tingkatStres;
  const persen = hasil.persentaseCF;

  const colorConfig = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: CheckCircle,
      iconColor: "text-green-500",
      bar: "bg-green-500",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      bar: "bg-yellow-500",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: XCircle,
      iconColor: "text-red-500",
      bar: "bg-red-500",
    },
  };

  const config = colorConfig[tingkat?.warna as keyof typeof colorConfig] || colorConfig.green;
  const Icon = config.icon;

  const saranList = (tingkat?.saran || "").split("\n").filter(s => s.trim());
  const gejalaTerpilih = JSON.parse(konsultasi.gejalaTerpilih || "[]");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Hasil Utama */}
        <div className={clsx("rounded-2xl border-2 p-8 text-center mb-6", config.bg, config.border)}>
          <Icon className={clsx("w-16 h-16 mx-auto mb-4", config.iconColor)} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hasil Screening Stres</h1>
          <p className="text-gray-600 mb-4">Halo, <strong>{konsultasi.nama}</strong></p>

          <div className="mb-4">
            <StressBadge tingkat={tingkat} size="lg" />
          </div>

          {/* CF Bar */}
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Nilai Certainty Factor</span>
              <span className="font-bold">{persen.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={clsx("h-4 rounded-full transition-all duration-1000", config.bar)}
                style={{ width: `${Math.min(persen, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">CF = {hasil.nilaiCF.toFixed(4)}</p>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Tentang Kondisimu</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{tingkat?.deskripsi}</p>
        </div>

        {/* Saran */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Rekomendasi Penanganan</h2>
          <ul className="space-y-2">
            {saranList.map((saran, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                <span>{saran.replace(/^[•\-]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detail CF */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Detail Perhitungan CF</h2>
          <div className="space-y-3">
            {Object.entries(hasil.cfPerTingkat).map(([id, cf]) => {
              const pct = (cf as number) * 100;
              const labels: Record<string, { nama: string; warna: string }> = {
                "1": { nama: "Stres Rendah", warna: "bg-green-400" },
                "2": { nama: "Stres Sedang", warna: "bg-yellow-400" },
                "3": { nama: "Stres Tinggi", warna: "bg-red-400" },
              };
              const label = labels[id] || { nama: `Tingkat ${id}`, warna: "bg-blue-400" };
              return (
                <div key={id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label.nama}</span>
                    <span className="font-medium">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={clsx("h-2 rounded-full", label.warna)}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Berdasarkan {gejalaTerpilih.length} gejala yang dipilih
          </p>
        </div>

        {/* Info Konsultasi */}
        <div className="card mb-6 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-2">
            {konsultasi.nim && <div><span className="font-medium">NIM:</span> {konsultasi.nim}</div>}
            {konsultasi.jurusan && <div><span className="font-medium">Jurusan:</span> {konsultasi.jurusan}</div>}
            {konsultasi.semester && <div><span className="font-medium">Semester:</span> {konsultasi.semester}</div>}
            <div>
              <span className="font-medium">Tanggal:</span>{" "}
              {new Date(konsultasi.createdAt).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
          <strong>Catatan:</strong> Hasil ini adalah screening awal dan bukan diagnosis klinis.
          Jika kamu merasa membutuhkan bantuan lebih lanjut, konsultasikan dengan psikolog atau
          konselor kampus. Hotline kesehatan mental: <strong>119 ext 8</strong>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/konsultasi" className="btn-primary flex items-center justify-center gap-2 flex-1">
            <RotateCcw className="w-4 h-4" />
            Screening Ulang
          </Link>
          <Link href="/riwayat" className="btn-secondary flex items-center justify-center gap-2 flex-1">
            <History className="w-4 h-4" />
            Lihat Riwayat Saya
          </Link>
          <Link href="/" className="btn-secondary flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
