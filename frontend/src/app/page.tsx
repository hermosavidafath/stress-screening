import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Brain,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Kenali Tingkat Stres{" "}
            <span className="text-blue-600">Dirimu</span> Lebih Awal
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            StressCheck adalah sistem screening stres mahasiswa berbasis web
            yang menggunakan metode <strong>Certainty Factor (CF)</strong> untuk
            mengidentifikasi tingkat stres dan memberikan rekomendasi penanganan
            yang tepat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/konsultasi" className="btn-primary flex items-center justify-center gap-2 text-base">
              Mulai Screening Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/riwayat" className="btn-secondary flex items-center justify-center gap-2 text-base">
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Bagaimana Cara Kerjanya?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ClipboardList,
              color: "blue",
              title: "1. Isi Kuesioner",
              desc: "Pilih gejala yang kamu rasakan dan tentukan tingkat keyakinanmu terhadap setiap gejala.",
            },
            {
              icon: TrendingUp,
              color: "purple",
              title: "2. Proses ",
              desc: "Sistem menghitung berdasarkan gejala dan aturan yang telah dikonfigurasi pakar.",
            },
            {
              icon: ShieldCheck,
              color: "green",
              title: "3. Hasil & Saran",
              desc: "Mendapatkan hasil screening tingkat stres beserta saran penanganan yang sesuai.",
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card text-center hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-xl bg-${color}-100 mb-4`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Tingkat Stres */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Kategori Tingkat Stres
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              kode: "Rendah",
              warna: "green",
              bg: "bg-green-50",
              border: "border-green-200",
              text: "text-green-700",
              badge: "bg-green-100 text-green-800",
              desc: "Stres dalam batas normal. Mampu mengelola tekanan sehari-hari dengan baik.",
              cf: "CF < 40%",
            },
            {
              kode: "Sedang",
              warna: "yellow",
              bg: "bg-yellow-50",
              border: "border-yellow-200",
              text: "text-yellow-700",
              badge: "bg-yellow-100 text-yellow-800",
              desc: "Stres cukup signifikan. Perlu perhatian dan pengelolaan stres yang lebih baik.",
              cf: "CF 40% - 69%",
            },
            {
              kode: "Tinggi",
              warna: "red",
              bg: "bg-red-50",
              border: "border-red-200",
              text: "text-red-700",
              badge: "bg-red-100 text-red-800",
              desc: "Stres sangat tinggi. Memerlukan perhatian serius dan bantuan profesional.",
              cf: "CF ≥ 70%",
            },
          ].map(({ kode, bg, border, text, badge, desc, cf }) => (
            <div key={kode} className={`rounded-xl border-2 ${border} ${bg} p-6`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${badge}`}>
                  Stres {kode}
                </span>
                <span className={`text-xs font-mono font-medium ${text}`}>{cf}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Perhatian Penting</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              Sistem ini adalah alat <strong>screening awal</strong> dan bukan pengganti diagnosis
              klinis dari psikolog atau psikiater. Hasil screening hanya sebagai panduan awal.
              Jika kamu merasa membutuhkan bantuan lebih lanjut, segera konsultasikan dengan
              profesional kesehatan mental.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: "Gejala Teridentifikasi", value: "22" },
            { icon: Brain, label: "Aturan CF", value: "13" },
            { icon: Users, label: "Kategori Gejala", value: "4" },
            { icon: ShieldCheck, label: "Tingkat Stres", value: "3" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card text-center">
              <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-gray-500">
          <p>© 2026 StressCheck — Sistem Screening Stres Mahasiswa</p>
        </div>
      </footer>
    </div>
  );
}
