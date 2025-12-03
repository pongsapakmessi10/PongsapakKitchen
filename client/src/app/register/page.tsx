"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAlert } from "../../components/AlertProvider";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      showAlert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ", "success");
      router.push("/login");
    } catch (err: any) {
      showAlert(err.response?.data?.msg || "เกิดข้อผิดพลาด", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">สมัครสมาชิก</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อผู้ใช้ (Username)"
            className="w-full p-2 border rounded"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
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
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          มีบัญชีแล้ว? <Link href="/login" className="text-orange-500 underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
