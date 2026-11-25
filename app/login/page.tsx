"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      // Simpan token dan data user ke Cookies
      Cookies.set("token", response.data.access_token, { expires: 1 }); // Berlaku 1 hari
      Cookies.set("userName", response.data.user.name, { expires: 1 });
      Cookies.set("userRole", response.data.user.roles[0], { expires: 1 });

      alert("Login Sukses!");

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-black">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
          Login Sistem
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Akun Kasir: kasir@tokoxyz.com (password123)</p>
          <p>Akun Pemilik: bos@tokoxyz.com (password123)</p>
        </div>
      </div>
    </div>
  );
}
