"use client"; // บรรทัดนี้สำคัญมาก บอก Next.js ว่าหน้านี้มี Interaction (กดปุ่ม/พิมพ์)

import { useState } from "react";
import axios from "axios";
import { Search, Utensils, AlertCircle, Heart } from "lucide-react"; // ไอคอนสวยๆ
import Image from "next/image";
import Navbar from "../components/Navbar"; // เรียกใช้ Navbar
import { useAlert } from "../components/AlertProvider";
import SplitText from "../components/SplitText";
import Link from "next/link";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  // ฟังก์ชันบันทึกเมนูโปรด
  const addToFavorite = async (recipe: any) => {
    const token = localStorage.getItem("token");

    // 1. ถ้าไม่มี Token (ยังไม่ล็อกอิน)
    if (!token) {
      showAlert("กรุณาเข้าสู่ระบบก่อนบันทึกเมนูโปรด!", "warning");
      // อาจจะ Redirect ไปหน้า Login ก็ได้ถ้าต้องการ
      // window.location.href = "/login";
      return;
    }

    try {
      // 2. ยิง API บันทึก
      await axios.post(
        "http://localhost:5000/api/favorites",
        {
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          missedIngredientCount: recipe.missedIngredientCount,
          usedIngredientCount: recipe.usedIngredientCount,
        },
        { headers: { "x-auth-token": token } } // แนบ Token ไปยืนยันตัวตน
      );
      showAlert("บันทึกเมนูเรียบร้อย! ❤️", "success");
    } catch (error: any) {
      // ถ้า Error (เช่น เคยบันทึกไปแล้ว)
      showAlert(error.response?.data?.msg || "เกิดข้อผิดพลาดในการบันทึก", "error");
    }
  };

  // ฟังก์ชันค้นหา
  const handleSearch = async () => {
    if (!ingredients) return;
    setLoading(true);
    try {
      // ยิงไปหา Server Express ของเรา (พอร์ต 5000)
      const res = await axios.get(`http://localhost:5000/api/recipes/search`, {
        params: { ingredients: ingredients },
      });
      setRecipes(res.data);
    } catch (error:any) {
      console.error("Error fetching recipes:", error);
      if (error.response && error.response.status === 402) {
        showAlert("⚠️ ขออภัย! โควต้าการใช้งานวันนี้หมดแล้ว\nโปรดรอใช้งานใหม่ในวันพรุ่งนี้ (Spoonacular API Limit Reached)", "warning");
      } else {
        showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* 1. ใส่ Navbar ไว้บนสุด */}
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
            <Utensils className="w-9 h-9 sm:w-10 sm:h-10 text-orange-500" />
            <SplitText
              text="Fridge to Table"
              className="leading-tight"
              delay={80}
              duration={0.5}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 18 }}
              to={{ opacity: 1, y: 0 }}
              rootMargin="-120px"
            />
          </h1>
          <SplitText
            text="By Pongsapak Jongsomsuk"
            className="font-bold text-gray-700"
            delay={120}
            duration={0.6}
            ease="power2.out"
            splitType="words"
            gap="0.4rem"
            from={{ opacity: 0, y: 14 }}
            to={{ opacity: 1, y: 0 }}
            rootMargin="-120px"
          />
         
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-2 mb-12">
          <input
            type="text"
            // แก้ตรงนี้ครับ 👇
            placeholder="เช่น ไก่, ไข่, ข้าวสวย (หรือพิมพ์ chicken, rice)"
            className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {loading ? (
              "กำลังค้นหา..."
            ) : (
              <>
                <Search size={20} /> ค้นหา
              </>
            )}
          </button>
        </div>

        {/* Results Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 relative flex flex-col animate-pulse"
                >
                  <div className="h-52 sm:h-56 bg-gray-200" />
                  <div className="p-5 flex flex-col h-full space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-100 rounded mt-auto" />
                  </div>
                </div>
              ))
            : recipes.map((recipe: any, idx: number) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100 relative group flex flex-col"
                >
                  {/* รูปอาหาร */}
                  <div className="h-52 sm:h-56 overflow-hidden relative">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      priority={idx < 2}
                    />

                    {/* ปุ่มหัวใจ (Favorite Button) - อยู่มุมซ้ายบนของรูป */}
                    <button
                      onClick={() => addToFavorite(recipe)}
                      className="absolute top-2 left-2 bg-white/90 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition shadow-sm z-10 active:scale-90"
                      title="บันทึกเมนูโปรด"
                    >
                      <Heart size={20} />
                    </button>

                    {/* ป้ายบอกว่าใช้วัตถุดิบเรากี่อย่าง */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      ใช้ของที่มี {recipe.usedIngredientCount} อย่าง
                    </div>
                  </div>

                  {/* เนื้อหา */}
                  <div className="p-5 flex flex-col h-full">
                    <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2 min-h-14">
                      {recipe.title}
                    </h3>

                    {/* วัตถุดิบที่ต้องซื้อเพิ่ม (Missing) */}
                    {recipe.missedIngredientCount > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-red-500 mb-1 flex items-center gap-1">
                          <AlertCircle size={12} /> ขาดอีก{" "}
                          {recipe.missedIngredientCount} อย่าง:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recipe.missedIngredients
                            .slice(0, 3)
                            .map((ing: any) => (
                              <span
                                key={ing.name}
                                className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded border border-red-100"
                              >
                                {ing.name}
                              </span>
                            ))}
                          {recipe.missedIngredients.length > 3 && (
                            <span className="text-xs text-gray-400 self-center">
                              ...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ปุ่มดูวิธีทำ */}
                    <Link
                      href={`/recipe/${recipe.id}`}
                      className="mt-auto block w-full text-center bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      ดูวิธีทำ
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
