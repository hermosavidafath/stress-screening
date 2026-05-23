"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Konsultasi } from "@/lib/types";
import StressBadge from "@/components/StressBadge";
import toast from "react-hot-toast";
import { Search, Trash2, Loader2, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";

export default function KonsultasiAdminPage() {
  const [data, setData] = useState<Konsultasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<Konsultasi | null>(null);

  useEffect(() => { fetchData(); }, [page, filterTingkat]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("/konsultasi", {
        params: { page, limit: 10, tingkat: filterTingkat || undefined, search: search || undefined },
      });
      setData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus data konsultasi ini?")) return;
    try {
      await api.delete(`/konsultasi/${id}`);
      toast.success("Data dihapus");
      fetchData();
    } catch { toast.error("Gagal menghapus"); }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchData();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Konsultasi</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total konsultasi</p>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            className="input flex-1 min-w-48"
            placeholder="Cari nama atau NIM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="input w-44"
            value={filterTingkat}
            onChange={e => { setFilterTingkat(e.target.value); setPage(1); }}
          >
            <option value="">Semua Tingkat</option>
            <option value="RENDAH">Stres Rendah</option>
            <option value="SEDANG">Stres Sedang</option>
            <option value="TINGGI">Stres Tinggi</option>
          </select>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Search className="w-4 h-4" /> Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Nama</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">NIM</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Jurusan</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Tingkat</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">CF</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Tanggal</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Tidak ada data</td></tr>
                ) : data.map(k => (
                  <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{k.nama}</td>
                    <td className="py-3 px-4 text-gray-500">{k.nim || "-"}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {k.jurusan || "-"}
                      {k.semester && <span className="text-xs text-gray-400"> (Sem {k.semester})</span>}
                    </td>
                    <td className="py-3 px-4"><StressBadge tingkat={k.tingkatStres} /></td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-medium">
                      {k.persentaseCF?.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(k.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setDetail(k)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(k.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Detail Konsultasi</h2>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Nama:</span> <span className="font-medium">{detail.nama}</span></div>
                <div><span className="text-gray-500">NIM:</span> <span className="font-medium">{detail.nim || "-"}</span></div>
                <div><span className="text-gray-500">Jurusan:</span> <span className="font-medium">{detail.jurusan || "-"}</span></div>
                <div><span className="text-gray-500">Semester:</span> <span className="font-medium">{detail.semester || "-"}</span></div>
                <div><span className="text-gray-500">Umur:</span> <span className="font-medium">{detail.umur || "-"}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium">{detail.email || "-"}</span></div>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-500">Hasil:</span>
                  <StressBadge tingkat={detail.tingkatStres} />
                  <span className="font-mono font-bold text-blue-600">{detail.persentaseCF?.toFixed(1)}%</span>
                </div>
              </div>
              {detail.saran && (
                <div className="border-t pt-3">
                  <p className="text-gray-500 font-medium mb-2">Saran:</p>
                  <div className="text-gray-700 text-xs leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3">
                    {detail.saran}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
