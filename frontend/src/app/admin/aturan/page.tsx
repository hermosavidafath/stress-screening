"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Aturan, Gejala } from "@/lib/types";
import StressBadge from "@/components/StressBadge";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2, X, GitBranch } from "lucide-react";

export default function AturanPage() {
  const [aturans, setAturans] = useState<Aturan[]>([]);
  const [gejalas, setGejalas] = useState<Gejala[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Aturan | null>(null);
  const [form, setForm] = useState({
    kode: "", nama: "", tingkatStresId: "", cfPakar: "0.7", gejalaIds: [] as number[],
  });
  const [saving, setSaving] = useState(false);

  const tingkatOptions = [
    { id: 1, nama: "Stres Rendah", kode: "RENDAH" },
    { id: 2, nama: "Stres Sedang", kode: "SEDANG" },
    { id: 3, nama: "Stres Tinggi", kode: "TINGGI" },
  ];

  useEffect(() => {
    Promise.all([
      api.get("/aturan"),
      api.get("/gejala?aktif=true"),
    ]).then(([a, g]) => {
      setAturans(a.data.data);
      setGejalas(g.data.data);
    }).catch(() => toast.error("Gagal memuat data"))
    .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditData(null);
    setForm({ kode: "", nama: "", tingkatStresId: "", cfPakar: "0.7", gejalaIds: [] });
    setShowModal(true);
  }

  function openEdit(a: Aturan) {
    setEditData(a);
    setForm({
      kode: a.kode,
      nama: a.nama,
      tingkatStresId: String(a.tingkatStres.id),
      cfPakar: String(a.cfPakar),
      gejalaIds: a.aturanGejala.map(ag => ag.gejala.id),
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.gejalaIds.length === 0) { toast.error("Pilih minimal 1 gejala"); return; }
    setSaving(true);
    try {
      const payload = { ...form, tingkatStresId: parseInt(form.tingkatStresId), cfPakar: parseFloat(form.cfPakar) };
      if (editData) {
        await api.put(`/aturan/${editData.id}`, payload);
        toast.success("Aturan diupdate");
      } else {
        await api.post("/aturan", payload);
        toast.success("Aturan ditambahkan");
      }
      setShowModal(false);
      const res = await api.get("/aturan");
      setAturans(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus aturan ini?")) return;
    try {
      await api.delete(`/aturan/${id}`);
      toast.success("Aturan dihapus");
      setAturans(prev => prev.filter(a => a.id !== id));
    } catch { toast.error("Gagal menghapus"); }
  }

  function toggleGejala(id: number) {
    setForm(prev => ({
      ...prev,
      gejalaIds: prev.gejalaIds.includes(id)
        ? prev.gejalaIds.filter(g => g !== id)
        : [...prev.gejalaIds, id],
    }));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-blue-600" />
            Kelola Aturan CF
          </h1>
          <p className="text-gray-500 text-sm mt-1">{aturans.length} aturan aktif</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Aturan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {aturans.map(a => (
            <div key={a.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-gray-400">{a.kode}</span>
                    <h3 className="font-semibold text-gray-900">{a.nama}</h3>
                    <StressBadge tingkat={a.tingkatStres} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {a.aturanGejala.map(ag => (
                      <span key={ag.gejala.id} className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {ag.gejala.kode}: {ag.gejala.nama}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-blue-600 font-mono">{a.cfPakar}</div>
                  <div className="text-xs text-gray-400">CF Pakar</div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editData ? "Edit Aturan" : "Tambah Aturan"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kode Aturan *</label>
                  <input className="input" placeholder="R001" value={form.kode} onChange={e => setForm(p => ({ ...p, kode: e.target.value }))} required disabled={!!editData} />
                </div>
                <div>
                  <label className="label">CF Pakar (0.1-1.0) *</label>
                  <input type="number" className="input" min="0.1" max="1.0" step="0.05" value={form.cfPakar} onChange={e => setForm(p => ({ ...p, cfPakar: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Nama Aturan *</label>
                <input className="input" placeholder="Nama aturan" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Tingkat Stres *</label>
                <select className="input" value={form.tingkatStresId} onChange={e => setForm(p => ({ ...p, tingkatStresId: e.target.value }))} required>
                  <option value="">Pilih tingkat stres</option>
                  {tingkatOptions.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Gejala yang Terlibat * ({form.gejalaIds.length} dipilih)</label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1.5">
                  {gejalas.map(g => (
                    <label key={g.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                      <input
                        type="checkbox"
                        checked={form.gejalaIds.includes(g.id)}
                        onChange={() => toggleGejala(g.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs font-mono text-gray-400 w-10">{g.kode}</span>
                      <span className="text-sm text-gray-700">{g.nama}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editData ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
