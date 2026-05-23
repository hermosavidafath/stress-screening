"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Konsultasi } from "@/lib/types";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2, Phone, Mail, User, BookOpen } from "lucide-react";

export default function StresBerat() {
  const [data, setData] = useState<Konsultasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/konsultasi/stres-berat")
      .then(res => setData(res.data.data))
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Mahasiswa Stres Tinggi
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {data.length} mahasiswa teridentifikasi stres tinggi — perlu perhatian segera
        </p>
      </div>

      {/* Alert */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          <p className="font-semibold mb-1">Perhatian Konselor</p>
          <p>Mahasiswa berikut teridentifikasi memiliki tingkat stres tinggi (CF ≥ 70%).
          Segera lakukan tindak lanjut berupa konseling atau rujukan ke layanan kesehatan mental.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>
      ) : data.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada mahasiswa dengan stres tinggi saat ini</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map(k => (
            <div key={k.id} className="bg-white border-2 border-red-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{k.nama}</h3>
                  {k.nim && <p className="text-sm text-gray-500">NIM: {k.nim}</p>}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{k.persentaseCF?.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">CF Stres</div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                {k.jurusan && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                    {k.jurusan}{k.semester && ` - Semester ${k.semester}`}
                  </div>
                )}
                {k.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {k.email}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(k.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700">
                <p className="font-medium mb-1">Saran tindak lanjut:</p>
                <p>{(k.saran || "").split("\n")[0].replace(/^[•\-]\s*/, "")}</p>
              </div>

              {k.email && (
                <a
                  href={`mailto:${k.email}?subject=Tindak Lanjut Screening Stres&body=Halo ${k.nama}, berdasarkan hasil screening stres kamu, kami ingin mengundang kamu untuk konseling lebih lanjut.`}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Hubungi via Email
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hotline */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 text-sm">Hotline Kesehatan Mental</p>
            <p className="text-blue-700 text-sm">Into The Light Indonesia: <strong>119 ext 8</strong> | Yayasan Pulih: <strong>(021) 788-42580</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
