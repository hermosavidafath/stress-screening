"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Gejala, KATEGORI_LABELS } from "@/lib/types";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import clsx from "clsx";

const KATEGORI_OPTIONS = ["psikologis", "akademik", "fisik", "sosial"];

export default function GejalaPage() {
  const [gejalas, setGejalas] = useState<Gejala[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Gejala | null>(null);
  const [form, setForm] = useState({
    kode: "", nama: "", deskripsi: "", kategori: "psikologis", bobot: "0.5",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchGejalas(); }, []);

  async function fetchGejalas() {
    setLoading(true);
    try {
      const res = await api.get("/gejala");
      setGejalas(res.data.data);
    } catch { toast.error("Gagal memuat gejala"); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditData(null);
    setForm({ kode: "", nama: "", deskripsi: "", kategori: "psikologis", bobot: "0.5" });
    setShowModal(true);
  }

  function openEdit(g: Gejala) {
    setEditData(g);
    setForm({ kode: g.kode, nama: g.nama, deskripsi: g.deskripsi, kategori: g.kategori, bobot: String(g.bobot) });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editData) {
        await api.put(`/gejala/${editData.id}`, { ...form, bobot: parseFloat(form.bobot) });
        toast.success("Gejala berhasil diupdate");
      } else {
        await api.post("/gejala", { ...form, bobot: parseFloat(form.bobot) });
        toast.success("Gejala berhasil ditambahkan");
      }
      setShowModal(false);
      fetchGejalas();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number, nama: string) {
    if (!confirm(`Hapus gejala "${nama}"?`)) return;
    try {
      await api.delete(`/gejala/${id}`);
      toast.success("Gejala dihapus");
      fetchGejalas();
    } catch { toast.error("Gagal menghapus"); }
  }

  const gejalaByKategori = gejalas.reduce<Record<string, Gejala[]>>((acc, g) => {
    if (!acc[g.kategori]) acc[g.kategori] = [];
    acc[g.kategori].push(g);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Gejala</h1>
          <p className="text-gray-500 text-sm mt-1">{gejalas.length} gejala terdaftar</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Gejala
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(gejalaByKategori).map(([kategori, items]) => (
            <div key={kategori} className="card">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {KATEGORI_LABELS[kategori] || kategori}
                <span className="text-xs text-gray-400 font-normal">({items.length})</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Kode</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Nama Gejala</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Bobot CF</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(g => (
                      <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono text-xs text-gray-500">{g.kode}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-900">{g.nama}</div>
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{g.deskripsi}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-blue-600 font-medium">{g.bobot}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={clsx(
                            "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                            g.aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          )}>
                            {g.aktif ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(g)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(g.id, g.nama)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editData ? "Edit Gejala" : "Tambah Gejala"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kode <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="G001" value={form.kode} onChange={e => setForm(p => ({ ...p, kode: e.target.value }))} required disabled={!!editData} />
                </div>
                <div>
                  <label className="label">Kategori <span className="text-red-500">*</span></label>
                  <select className="input" value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))}>
                    {KATEGORI_OPTIONS.map(k => (
                      <option key={k} value={k}>{KATEGORI_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Nama Gejala <span className="text-red-500">*</span></label>
                <input className="input" placeholder="Nama gejala" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Deskripsi</label>
                <textarea className="input" rows={2} placeholder="Deskripsi gejala" value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} />
              </div>
              <div>
                <label className="label">Bobot CF Pakar (0.1 - 1.0) <span className="text-red-500">*</span></label>
                <input type="number" className="input" min="0.1" max="1.0" step="0.1" value={form.bobot} onChange={e => setForm(p => ({ ...p, bobot: e.target.value }))} required />
                <p className="text-xs text-gray-400 mt-1">Berdasarkan analisis dataset: kecemasan/depresi = 0.8, tidur/akademik = 0.6-0.7, sosial/fisik = 0.4-0.5</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editData ? "Simpan Perubahan" : "Tambah Gejala"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
