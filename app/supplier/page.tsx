"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [namaUsaha, setNamaUsaha] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/supplier",
        axiosConfig,
      );
      setSuppliers(response.data);
    } catch (error) {
      console.error("Gagal menarik data supplier", error);
    }
  };

  useEffect(() => {
    setUserRole(Cookies.get("userRole") || "");
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/supplier",
        {
          nama_usaha: namaUsaha,
          no_telp: noTelp,
        },
        axiosConfig,
      );

      alert("Supplier berhasil ditambahkan!");
      setNamaUsaha("");
      setNoTelp("");
      fetchSuppliers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menambah supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Yakin ingin menghapus supplier ini? Peringatan: Akan gagal jika supplier ini sudah memiliki histori barang masuk!",
      )
    )
      return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/supplier/${id}`,
        axiosConfig,
      );
      fetchSuppliers();
    } catch (error: any) {
      alert(
        "Gagal menghapus! Pastikan supplier ini tidak sedang digunakan pada data produk/pengadaan.",
      );
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Manajemen Data Supplier
      </h1>

      {userRole === "pemilik" ? (
        <div className="bg-white p-6 rounded-lg shadow mb-8 text-black border-t-4 border-green-600">
          <h2 className="text-xl font-bold mb-4">Tambah Supplier Baru</h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Nama Usaha / PT
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={namaUsaha}
                onChange={(e) => setNamaUsaha(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                No. Telepon / WA
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={noTelp}
                onChange={(e) => setNoTelp(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 disabled:opacity-50 h-[42px]"
            >
              {loading ? "Menyimpan..." : "Simpan Supplier"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded mb-6 border border-yellow-200">
          Anda login sebagai <strong>{userRole}</strong>. Anda hanya bisa
          melihat daftar supplier.
        </div>
      )}

      {/* Tabel Data Supplier */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Nama Usaha / Perusahaan</th>
              <th className="p-4 border-b">Kontak (No. Telp)</th>
              <th className="p-4 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-black">
                  Memuat data...
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="hover:bg-gray-50 text-black border-b"
                >
                  <td className="p-4">{supplier.id}</td>
                  <td className="p-4 font-bold">{supplier.nama_usaha}</td>
                  <td className="p-4">{supplier.no_telp || "-"}</td>
                  <td className="p-4 text-center">
                    {userRole === "pemilik" && (
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200 font-bold"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
