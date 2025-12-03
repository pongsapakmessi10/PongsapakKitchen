"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, ChefHat } from "lucide-react";
import { useAlert } from "./AlertProvider";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const stored = localStorage.getItem("username");
    if (stored !== null) {
      setUsername(stored);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    showAlert("ออกจากระบบเรียบร้อย", "success");
    router.push("/login");
    window.location.href = "/login"; // Force refresh state
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-4 sm:px-6 flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
      <Link
        href="/"
        className="text-lg sm:text-xl font-bold text-orange-600 flex items-center gap-2"
      >
        <ChefHat /> Pongsapak&apos;s Kitchen
      </Link>

      <div className="flex items-center gap-3 sm:gap-4 ml-auto flex-wrap justify-end">
        {username ? (
          <>
            <span className="text-gray-600 hidden md:inline">
              สวัสดี, <span className="font-bold text-orange-500">{username}</span>
            </span>
            <Link
              href="/dashboard"
              className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-200 transition w-full sm:w-auto text-center"
            >
              เมนูโปรดของฉัน
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-gray-600 hover:text-orange-600 font-medium text-sm sm:text-base"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition text-sm sm:text-base text-center"
            >
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
