"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Navbar from "../../components/Navbar"; // Import Navbar มาใช้
import { Trash2, ExternalLink } from "lucide-react";
import { useAlert } from "../../components/AlertProvider";

interface FavoriteItem {
  _id: string; // ID ของ MongoDB (เอาไว้ลบ)
  recipeId: number;
  title: string;
  image: string;
  savedAt: string;
}

export default function Dashboard() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  // ดึงข้อมูลเมนูโปรด
  useEffect(() => {
    const fetchFavorites = async () => {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE ||
        "https://pongsapakkitchen.onrender.com";
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login"; // ถ้าไม่มี token ดีดไปหน้า login
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/favorites`, {
          headers: { "x-auth-token": token }, // แนบ Token ไปด้วย
        });
        setFavorites(res.data);
      } catch (error) {
        console.error("Error fetching favorites", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // ฟังก์ชันลบเมนู
  const removeFavorite = async (mongoId: string) => {
    if (!confirm("ต้องการลบเมนูนี้ออกจากรายการโปรด?")) return;

    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE ||
        "https://pongsapakkitchen.onrender.com";
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/favorites/${mongoId}`, {
        headers: { "x-auth-token": token },
      });
      // ลบออกจาก State ทันที (ไม่ต้องโหลดหน้าใหม่)
      setFavorites(favorites.filter((fav) => fav._id !== mongoId));
    } catch (error) {
      showAlert("ลบไม่สำเร็จ", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🍽️ เมนูโปรดของคุณ</h1>

        {loading ? (
          <p>กำลังโหลด...</p>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">ยังไม่มีเมนูโปรด</p>
            <Link href="/" className="text-white bg-orange-500 p-3 rounded-xl mt-2 inline-block hover:text-orange-500 hover:bg-white active:text-red-900">ไปค้นหาเมนูอร่อยๆ กันเถอะ</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <div key={fav._id} className="bg-white rounded-xl shadow overflow-hidden group">
                <div className="h-40 overflow-hidden relative">
                  <img src={fav.image} alt={fav.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{fav.title}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <Link 
                      href={`/recipe/${fav.recipeId}`} 
                      className="text-sm text-orange-600 font-semibold flex items-center gap-1 hover:underline"
                    >
                       ดูวิธีทำ <ExternalLink size={14}/>
                    </Link>
                    <button 
                      onClick={() => removeFavorite(fav._id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                      title="ลบรายการ"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
