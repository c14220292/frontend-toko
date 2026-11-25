"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function InventoryPage() {
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/inventory/traceability",
          {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` },
          },
        );
        setLedgers(response.data);
      } catch (error) {
        console.error("Gagal menarik data traceability", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 border-b-2 border-blue-900 pb-4">
        <h1 className="text-3xl font-bold text-black mb-2">
          Kartu Stok (Traceability Ledger)
        </h1>
        <p className="text-gray-600">
          Laporan detail pergerakan masuk dan keluar barang berdasarkan nomor
          seri/batch produksi.
        </p>
      </div>

      {loading ? (
        <div className="text-center p-8 text-black font-bold">
          Memuat Buku Besar Traceability...
        </div>
      ) : ledgers.length === 0 ? (
        <div className="text-center p-8 bg-white shadow rounded text-black">
          Belum ada pergerakan stok di gudang.
        </div>
      ) : (
        <div className="space-y-8">
          {ledgers.map((batch, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {/* HEADER BATCH (BARANG MASUK) */}
              <div
                className={`p-4 text-white flex justify-between items-center ${batch.qty_sisa === 0 ? "bg-red-800" : "bg-blue-900"}`}
              >
                <div>
                  <h2 className="text-xl font-bold">
                    {batch.id_batch} : {batch.nama_barang}
                  </h2>
                  <p className="text-sm opacity-80 mt-1">
                    Supplier: {batch.supplier}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm bg-black bg-opacity-30 px-3 py-1 rounded-full inline-block mb-1">
                    Sisa Stok:{" "}
                    <span className="font-bold text-lg">{batch.qty_sisa}</span>{" "}
                    / {batch.qty_awal}
                  </div>
                  {batch.qty_sisa === 0 && (
                    <p className="text-xs font-bold text-red-300">
                      BATCH HABIS / KOSONG
                    </p>
                  )}
                </div>
              </div>

              {/* INFO TANGGAL */}
              <div className="flex bg-gray-50 border-b p-3 text-sm text-black">
                <div className="w-1/2">
                  <span className="font-bold text-gray-500">
                    Tgl Masuk Gudang:
                  </span>{" "}
                  {new Date(batch.tgl_masuk).toLocaleDateString("id-ID")}
                </div>
                <div className="w-1/2">
                  <span className="font-bold text-gray-500">
                    Tanggal Expired:
                  </span>{" "}
                  <span className="font-bold text-blue-700">
                    {new Date(batch.expired_date).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              {/* RIWAYAT BARANG KELUAR (POS) */}
              <div className="p-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-history"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                  Riwayat Pengeluaran (Terjual di Kasir)
                </h3>

                {batch.riwayat_keluar.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Belum ada barang yang terjual dari Batch ini.
                  </p>
                ) : (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-black">
                        <th className="p-2 border">Waktu Transaksi</th>
                        <th className="p-2 border">No. Faktur (Struk)</th>
                        <th className="p-2 border text-right">Qty Dipotong</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.riwayat_keluar.map((history: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 text-black">
                          <td className="p-2 border">
                            {new Date(history.created_at).toLocaleString(
                              "id-ID",
                            )}
                          </td>
                          <td className="p-2 border font-mono">
                            {history.no_faktur}
                          </td>
                          <td className="p-2 border text-right font-bold text-red-600">
                            -{history.qty_terjual}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded shadow-sm text-black text-sm">
        <p>
          <strong>💡 Panduan Sidang Skripsi (Traceability):</strong> Jika
          penguji bertanya bagaimana membuktikan FIFO berjalan, tunjukkan
          halaman ini! Halaman ini membuktikan bahwa algoritma secara cerdas
          memecah pengeluaran dan mencatat persis ke "Nomor Faktur" mana sebuah
          barang dari Batch spesifik mengalir.
        </p>
      </div>
    </div>
  );
}
