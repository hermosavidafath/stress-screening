"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Brain, GitBranch, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

interface Stats {
  totalKonsultasi: number;
  totalGejala: number;
  totalAturan: number;
  stresBerat: number;
  distribusi: { kode: string; nama: string; warna: string; jumlah: number; persentase: number }[];
}

const WARNA_MAP: Record<string, string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tren, setTren] = useState<{ tanggal: string; jumlah: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/tren"),
    ]).then(([statsRes, trenRes]) => {
      setStats(statsRes.data.data);
      setTren(trenRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Konsultasi", value: stats?.totalKonsultasi || 0, icon: Users, color: "blue" },
    { label: "Total Gejala", value: stats?.totalGejala || 0, icon: Brain, color: "purple" },
    { label: "Aturan CF Aktif", value: stats?.totalAturan || 0, icon: GitBranch, color: "indigo" },
    { label: "Stres Tinggi", value: stats?.stresBerat || 0, icon: AlertTriangle, color: "red" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan data sistem screening stres mahasiswa</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`inline-flex p-2 rounded-lg bg-${color}-100 mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribusi Pie Chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Distribusi Tingkat Stres
          </h2>
          {stats?.distribusi && stats.distribusi.some(d => d.jumlah > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.distribusi}
                  dataKey="jumlah"
                  nameKey="nama"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ nama, persentase }) => `${nama}: ${persentase}%`}
                  labelLine={false}
                >
                  {stats.distribusi.map((entry, i) => (
                    <Cell key={i} fill={WARNA_MAP[entry.warna] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} konsultasi`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Belum ada data konsultasi
            </div>
          )}
        </div>

        {/* Tren Bar Chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Tren Konsultasi 7 Hari Terakhir
          </h2>
          {tren.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tren}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 11 }}
                  tickFormatter={v => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={v => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                  formatter={(val) => [`${val} konsultasi`]}
                />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Belum ada data tren
            </div>
          )}
        </div>
      </div>

      {/* Distribusi Detail */}
      {stats?.distribusi && (
        <div className="card mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">Detail Distribusi</h2>
          <div className="space-y-3">
            {stats.distribusi.map(d => (
              <div key={d.kode}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{d.nama}</span>
                  <span className="text-gray-500">{d.jumlah} ({d.persentase}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: `${d.persentase}%`,
                      backgroundColor: WARNA_MAP[d.warna] || "#94a3b8",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
