"use client";
import { useState, useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

export default function PosPage() {
  const [varianId, setVarianId] = useState("");
  const [qty, setQty] = useState(1);
  const [minExpiry, setMinExpiry] = useState("");
  const [infoStok, setInfoStok] = useState<string>("Menunggu pembaruan...");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.Pusher = Pusher;
    window.Echo = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 80),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https") === "https",
      enabledTransports: ["ws", "wss"],
    });

    window.Echo.channel("inventory-channel").listen(
      ".StockUpdated",
      (e: any) => {
        setInfoStok(
          `🔥 UPDATE WEBSOCKET! Sisa stok Barang ID ${e.varian_id} = ${e.sisa_stok_baru}`,
        );
      },
    );

    return () => {
      window.Echo.leaveChannel("inventory-channel");
    };
  }, []);

  // --- FUNGSI UNTUK MENEMBAK API LARAVEL ---
  const handleCheckout = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Disesuaikan dengan routes/api.php milik Anda & melengkapi syarat database!
      const response = await axios.post(
        "http://localhost:8000/api/transaksi/checkout",
        {
          varian_id: Number(varianId),
          qty: Number(qty),
          min_expiry: minExpiry || null,
          total_pembayaran: 50000, // Data dummy agar validasi Laravel lolos
          status_pembayaran: "Lunas", // Data dummy agar validasi Laravel lolos
        },
      );

      // Jika berhasil
      alert(
        `SUKSES: ${response.data.message}\nSisa Stok Terbaru: ${response.data.sisa_stok_terbaru}`,
      );
    } catch (error: any) {
      // Jika gagal (misal: stok kurang, error FIFO, atau lock tabrakan)
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Terjadi kesalahan sistem";
      alert(`GAGAL: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">
        Point of Sales (Kasir)
      </h2>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-6 font-mono text-sm">
        <strong>Status WebSockets:</strong> {infoStok}
      </div>

      <form onSubmit={handleCheckout} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            ID Varian Barang (Coba ID 3 untuk Mowilex)
          </label>
          <input
            type="text"
            placeholder="Masukkan ID Barang"
            className="w-full border p-2 rounded"
            value={varianId}
            onChange={(e) => setVarianId(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="block text-sm font-medium mb-1">
              Jumlah (Qty)
            </label>
            <input
              type="number"
              min="1"
              className="w-full border p-2 rounded"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              required
            />
          </div>
          <div className="w-2/3">
            <label className="block text-sm font-medium mb-1">
              Syarat Expired (Opsional)
            </label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={minExpiry}
              onChange={(e) => setMinExpiry(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sedang Memproses..." : "Proses Transaksi"}
        </button>
      </form>
    </div>
  );
}
