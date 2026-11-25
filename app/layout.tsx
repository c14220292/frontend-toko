"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Toaster, toast } from "react-hot-toast"; // <-- Impor Toast
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Deklarasi global
declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = Cookies.get("userRole") || "";
    setUserName(Cookies.get("userName") || "");
    setUserRole(role);

    // Jika yang login adalah PEMILIK, aktifkan radar WebSockets untuk Notifikasi Kritis
    if (role === "pemilik") {
      window.Pusher = Pusher;
      window.Echo = new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 80),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
        forceTLS:
          (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https") === "https",
        enabledTransports: ["ws", "wss"],
      });

      // Dengarkan channel khusus Admin
      window.Echo.channel("admin-notif-channel").listen(
        ".StockKritisAlert",
        (e: any) => {
          // Munculkan Pop Up Merah yang berbunyi/bergetar di layar!
          toast.error(e.pesan, {
            duration: 8000,
            position: "top-right",
            style: {
              border: "2px solid red",
              padding: "16px",
              color: "#713200",
              fontWeight: "bold",
            },
            iconTheme: { primary: "red", secondary: "#FFFAEE" },
          });
        },
      );

      return () => {
        if (window.Echo) window.Echo.leaveChannel("admin-notif-channel");
      };
    }
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userName");
    Cookies.remove("userRole");
    router.push("/login");
  };

  const isLoginPage = pathname === "/login";

  return (
    <html lang="id">
      <body className="bg-gray-100 min-h-screen text-black">
        {/* Pasang Wadah Toast di sini agar muncul di semua halaman */}
        <Toaster />

        {!isLoginPage && (
          <header className="bg-blue-900 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Toko XYZ (Skripsi)</h1>
                {userName && (
                  <p className="text-xs text-blue-200">
                    Halo, {userName} ({userRole})
                  </p>
                )}
              </div>
              <nav className="space-x-4 flex items-center">
                <Link
                  href="/dashboard"
                  className={`hover:bg-blue-700 px-3 py-2 rounded ${pathname === "/dashboard" ? "bg-blue-800 font-bold" : ""}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/pos"
                  className={`hover:bg-blue-700 px-3 py-2 rounded ${pathname === "/pos" ? "bg-blue-800 font-bold" : ""}`}
                >
                  POS (Kasir)
                </Link>
                <Link
                  href="/produk"
                  className={`hover:bg-blue-700 px-3 py-2 rounded ${pathname === "/produk" ? "bg-blue-800 font-bold" : ""}`}
                >
                  Master Produk
                </Link>
                <Link
                  href="/supplier"
                  className={`hover:bg-blue-700 px-3 py-2 rounded ${pathname === "/supplier" ? "bg-blue-800 font-bold" : ""}`}
                >
                  Master Supplier
                </Link>
                <Link
                  href="/inbound"
                  className={`hover:bg-blue-700 px-3 py-2 rounded ${pathname === "/inbound" ? "bg-blue-800 font-bold" : ""}`}
                >
                  Penerimaan Barang
                </Link>
                <Link
                  href="/inventory"
                  className={`hover:bg-blue-700 px-3 py-2 rounded ${pathname === "/inventory" ? "bg-blue-800 font-bold" : ""}`}
                >
                  Data Batch
                </Link>
                <Link
                  href="/procurement"
                  className={`hover:bg-blue-700 px-3 py-2 rounded ${pathname === "/procurement" ? "bg-blue-800 font-bold" : ""}`}
                >
                  Pengadaan ROP
                </Link>

                {userName && (
                  <button
                    onClick={handleLogout}
                    className="ml-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold shadow"
                  >
                    Logout
                  </button>
                )}
              </nav>
            </div>
          </header>
        )}
        <main className="container mx-auto p-4 mt-4">{children}</main>
      </body>
    </html>
  );
}
