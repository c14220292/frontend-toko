"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function InboundPage() {
  const [options, setOptions] = useState<any[]>([]);
  const [varianSupplierId, setVarianSupplierId] = useState("");

  // PERBAIKAN NEXT.JS: Kosongkan state awal, isi tanggal hari ini di dalam useEffect
  const [tglMasuk, setTglMasuk] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [qtyAwal, setQtyAwal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${Cookies.get("token")}` },
  };

  useEffect(() => {
    setUserRole(Cookies.get("userRole") || "");

    // Set tanggal default hari ini di sisi klien (Client-side)
    setTglMasuk(new Date().toISOString().split("T")[0]);

    // Menarik data pilihan barang untuk dropdown
    const fetchOptions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/inbound/options",
          axiosConfig,
        );
        setOptions(response.data);
      } catch (error) {
        console.error("Gagal menarik data opsi barang", error);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/inbound",
        {
          varian_supplier_id: Number(varianSupplierId),
          tgl_masuk: tglMasuk,
          expired_date: expiredDate,
          qty_awal: Number(qtyAwal),
        },
        axiosConfig,
      );

      alert(
        "SUKSES: Barang masuk berhasil dicatat. Stok siap dijual di kasir!",
      );
      setVarianSupplierId("");
      setExpiredDate("");
      setQtyAwal(1);
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Gagal menyimpan data penerimaan barang",
      );
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== "pemilik") {
    return (
      <div className="p-8 text-center mt-20">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p className="text-black">
          Hanya Admin Gudang / Pemilik yang berhak mengakses halaman Penerimaan
          Barang.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black border-b-2 border-blue-900 pb-2">
        Form Penerimaan Barang (Inbound)
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg text-black border-t-4 border-green-600">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">
              1. Pilih Barang & Supplier Pabrik
            </label>
            <select
              className="w-full border p-3 rounded bg-gray-50"
              value={varianSupplierId}
              onChange={(e) => setVarianSupplierId(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Klik untuk Memilih Barang --
              </option>
              {options.map((opt) => (
                <option
                  key={opt.varian_supplier_id}
                  value={opt.varian_supplier_id}
                >
                  {opt.nama_lengkap}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-6">
            <div className="w-1/2">
              <label className="block text-sm font-bold mb-2">
                2. Tanggal Masuk
              </label>
              <input
                type="date"
                className="w-full border p-3 rounded bg-gray-50"
                value={tglMasuk}
                onChange={(e) => setTglMasuk(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-bold mb-2 text-red-600">
                3. Expired Date (Wajib Diisi)
              </label>
              <input
                type="date"
                className="w-full border p-3 rounded bg-red-50 border-red-200"
                value={expiredDate}
                onChange={(e) => setExpiredDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              4. Jumlah Diterima (Qty)
            </label>
            <input
              type="number"
              min="1"
              className="w-full border p-3 rounded bg-gray-50 text-xl font-bold"
              value={qtyAwal}
              onChange={(e) => setQtyAwal(Number(e.target.value))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !varianSupplierId}
            className="w-full bg-green-600 text-white font-bold py-4 rounded hover:bg-green-700 disabled:opacity-50 text-lg shadow-md"
          >
            {loading
              ? "Sedang Memproses..."
              : "Catat Barang Masuk & Buat Batch Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}
