"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAlert } from "../../components/AlertProvider";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE ||
        "https://pongsapakkitchen.onrender.com";
      const res = await axios.post(`${API_BASE}/api/auth/login`, formData);
      
      // ✅ เก็บ Token ลงในเครื่อง (Local Storage)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      
      showAlert("เข้าสู่ระบบสำเร็จ!", "success");
      router.push("/"); // เด้งกลับไปหน้าแรก
      // สั่งให้หน้าเว็บโหลดใหม่เพื่อให้ Header อัปเดตสถานะ
      window.location.href = "/"; 
    } catch (err: any) {
      const message = err.response?.data?.msg || "เข้าสู่ระบบไม่สำเร็จ";
      setError(message);
      showAlert(message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">เข้าสู่ระบบ</h1>
        
        {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="อีเมล"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 font-bold">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          ยังไม่มีบัญชี? <Link href="/register" className="text-orange-500 underline">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
