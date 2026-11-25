"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function ProdukPage() {
  const [produks, setProduks] = useState<any[]>([]);
  const [namaProduk, setNamaProduk] = useState("");
  const [kategori, setKategori] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Konfigurasi Token Global untuk Axios di komponen ini
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  };

  const fetchProduks = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/produk",
        axiosConfig,
      );
      setProduks(response.data);
    } catch (error) {
      console.error("Gagal menarik data produk", error);
    }
  };

  useEffect(() => {
    setUserRole(Cookies.get("userRole") || "");
    fetchProduks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/produk",
        {
          nama_produk: namaProduk,
          kategori: kategori,
        },
        axiosConfig,
      );

      alert("Produk berhasil ditambahkan!");
      setNamaProduk("");
      setKategori("");
      fetchProduks(); // Refresh tabel
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menambah produk");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/produk/${id}`, axiosConfig);
      fetchProduks(); // Refresh tabel
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menghapus produk");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Manajemen Data Produk
      </h1>

      {/* Form Tambah Produk (Hanya muncul jika Role = pemilik) */}
      {userRole === "pemilik" ? (
        <div className="bg-white p-6 rounded-lg shadow mb-8 text-black border-t-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4">Tambah Produk Baru</h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={namaProduk}
                onChange={(e) => setNamaProduk(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 disabled:opacity-50 h-[42px]"
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded mb-6 border border-yellow-200">
          Anda login sebagai <strong>{userRole}</strong>. Anda hanya bisa
          melihat daftar produk, tidak bisa mengubah data.
        </div>
      )}

      {/* Tabel Data Produk */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Nama Produk</th>
              <th className="p-4 border-b">Kategori</th>
              <th className="p-4 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produks.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-black">
                  Memuat data...
                </td>
              </tr>
            ) : (
              produks.map((produk) => (
                <tr
                  key={produk.id}
                  className="hover:bg-gray-50 text-black border-b"
                >
                  <td className="p-4">{produk.id}</td>
                  <td className="p-4 font-bold">{produk.nama_produk}</td>
                  <td className="p-4">{produk.kategori || "-"}</td>
                  <td className="p-4 text-center">
                    {userRole === "pemilik" && (
                      <button
                        onClick={() => handleDelete(produk.id)}
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
