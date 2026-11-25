"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function ProcurementPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRop = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/procurement/rop",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setRecommendations(response.data);
      } catch (error) {
        console.error("Gagal menarik data pengadaan", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRop();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-black">
        Rekomendasi Pengadaan (ROP & MOQ)
      </h2>

      {loading ? (
        <p className="text-center p-4 text-black">
          Memuat analisis algoritma ROP...
        </p>
      ) : recommendations.length === 0 ? (
        <p className="text-center p-4 text-black">
          Belum ada data barang dan aturan supplier.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded border-l-4 ${rec.needs_restock ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-black">
                    {rec.nama_lengkap}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Total Stok Saat Ini:{" "}
                    <span className="font-bold text-black text-lg">
                      {rec.current_stock}
                    </span>{" "}
                    {rec.satuan} | Batas Minimum (ROP):{" "}
                    <span className="font-bold text-black text-lg">
                      {rec.rop}
                    </span>{" "}
                    {rec.satuan}
                  </p>

                  <div className="bg-white p-3 rounded border text-sm mt-2 text-black">
                    <p className="font-semibold mb-1">
                      Informasi Aturan Pabrik/Supplier:
                    </p>
                    <ul className="list-disc pl-5">
                      <li>
                        Supplier: <strong>{rec.supplier_nama}</strong> (WA:{" "}
                        {rec.supplier_telp})
                      </li>
                      <li>
                        Lead Time (Lama Pengiriman):{" "}
                        <strong>{rec.lead_time_hari} Hari</strong>
                      </li>
                      <li>
                        Syarat Minimal Order (MOQ):{" "}
                        <strong>
                          {rec.moq} {rec.satuan}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-right w-1/3">
                  {rec.needs_restock ? (
                    <div className="bg-red-100 p-4 rounded shadow-sm border border-red-200">
                      <p className="text-red-700 font-bold mb-2 flex items-center justify-end gap-1 text-lg">
                        ⚠️ STOK KRITIS (Under ROP)
                      </p>
                      <p className="text-sm text-black">
                        Rekomendasi Pesan (Sesuai MOQ):
                      </p>
                      <p className="text-3xl font-black text-red-700 mt-1">
                        {rec.recommended_qty} {rec.satuan}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-100 p-4 rounded border border-green-200 h-full flex items-center justify-center">
                      <p className="text-green-700 font-bold text-lg">
                        ✅ STOK AMAN
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200 text-sm text-black">
        <p>
          <strong>Info Algoritma Skripsi (Rumusan Masalah 3):</strong> Sistem
          menghitung ROP dari asumsi penjualan & lead time. Jika stok turun di
          bawah ROP, sistem otomatis menghitung jumlah pesanan yang digenapkan
          sesuai kelipatan MOQ pabrik, sehingga toko tidak memesan dalam jumlah
          nanggung yang ditolak supplier.
        </p>
      </div>
    </div>
  );
}
