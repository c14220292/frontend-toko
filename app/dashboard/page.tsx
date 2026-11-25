"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserName(Cookies.get("userName") || "Pengguna");

    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/stats",
          {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` },
          },
        );
        setStats(response.data);
      } catch (error) {
        console.error("Gagal menarik data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-black text-center mt-20">
        Memuat Dashboard Eksekutif...
      </div>
    );

  // Format Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">
          Dashboard Eksekutif
        </h1>
        <p className="text-gray-600">
          Selamat datang kembali, {userName}. Berikut adalah ringkasan performa
          toko hari ini.
        </p>
      </div>

      {/* Tiga Kartu Metrik (Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm font-bold text-gray-500 mb-1">OMZET HARI INI</p>
          <p className="text-3xl font-black text-black">
            {formatRupiah(stats?.omzet_hari_ini || 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm font-bold text-gray-500 mb-1">
            TOTAL TRANSAKSI HARI INI
          </p>
          <p className="text-3xl font-black text-black">
            {stats?.transaksi_hari_ini || 0}{" "}
            <span className="text-sm font-normal text-gray-500">Struk</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-sm font-bold text-gray-500 mb-1">
            PERINGATAN STOK MENIPIS
          </p>
          <p className="text-3xl font-black text-red-600">
            {stats?.stok_kritis_count || 0}{" "}
            <span className="text-sm font-normal text-gray-500">
              Barang Perlu Dicek
            </span>
          </p>
        </div>
      </div>

      {/* Grafik Penjualan */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full h-[400px]">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Grafik Omzet 7 Hari Terakhir
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats?.grafik || []}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="tanggal" axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(value) => `Rp ${value / 1000}k`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any) => formatRupiah(Number(value))}
              cursor={{ fill: "#f3f4f6" }}
            />
            <Bar dataKey="total" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
