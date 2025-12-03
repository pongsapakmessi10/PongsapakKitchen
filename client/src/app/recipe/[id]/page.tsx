"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Clock, Users, ChefHat } from "lucide-react";
import Link from "next/link";
import { useAlert } from "../../../components/AlertProvider";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  extendedIngredients: {
    id: number;
    original: string;
    image: string;
  }[];
  nutrition?: {
    nutrients?: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
    }[];
  }[];
}

export default function RecipePage() {
  const { id } = useParams(); // ดึง ID จาก URL
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/recipes/${id}?lang=th`
        );
        setRecipe(res.data);
      } catch (error:any) {
        console.error("Error loading recipe", error);
        if (error.response && error.response.status === 402) {
           showAlert("⚠️ ขออภัย! โควต้าการใช้งานวันนี้หมดแล้ว ไม่สามารถดูวิธีทำได้", "warning");
        } else {
           showAlert("ไม่สามารถโหลดข้อมูลสูตรอาหารได้", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, showAlert]);

  const macros = useMemo(() => {
    const nutrients = recipe?.nutrition?.nutrients || [];
    const findNutrient = (name: string) =>
      nutrients.find((n) => n.name.toLowerCase() === name.toLowerCase());
    const protein = findNutrient("Protein");
    const carbs = findNutrient("Carbohydrates");
    const fat = findNutrient("Fat");
    const calories = findNutrient("Calories");

    return {
      calories,
      chartData: [
        {
          name: "Protein",
          value: protein?.amount ?? 0,
          unit: protein?.unit ?? "g",
          color: "#f97316",
        },
        {
          name: "Carbs",
          value: carbs?.amount ?? 0,
          unit: carbs?.unit ?? "g",
          color: "#a855f7",
        },
        {
          name: "Fat",
          value: fat?.amount ?? 0,
          unit: fat?.unit ?? "g",
          color: "#22c55e",
        },
      ],
    };
  }, [recipe]);
  const hasMacroData = macros.chartData.some((m) => m.value > 0);
  const hasCalories =
    macros.calories !== undefined && macros.calories.amount > 0;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-12">
        <div className="relative h-72 md:h-96 w-full overflow-hidden bg-gray-200 animate-pulse" />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid gap-8 lg:grid-cols-3">
          <section className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-1 animate-pulse">
            <div className="h-7 w-40 bg-gray-200 rounded mb-5" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/60"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 shrink-0" />
                  <div className="flex-1 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </section>
          <section className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2 animate-pulse">
            <div className="h-7 w-28 bg-gray-200 rounded mb-5" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  if (!recipe)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center p-10 text-gray-700">
        ไม่พบสูตรอาหาร
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden rounded-b-3xl shadow-sm">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <Link
          href="/"
          className="absolute top-6 left-4 sm:left-6 bg-white/90 px-3 py-2 rounded-full hover:bg-white transition flex items-center gap-2 text-sm font-semibold text-gray-800 shadow"
        >
          <ArrowLeft className="text-gray-800" size={18} />
          <span className="hidden sm:inline">กลับ</span>
        </Link>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight drop-shadow">
            {recipe.title}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <span className="flex items-center gap-1">
              <Clock size={16} /> {recipe.readyInMinutes} นาที
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} /> สำหรับ {recipe.servings} ที่
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid gap-8 lg:grid-cols-3">
        {/* Nutrition */}
        <section className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-3">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
            <div className="lg:w-1/2 space-y-2">
              <p className="text-sm uppercase tracking-[0.08em] text-orange-500 font-semibold">
                Nutrition Facts
              </p>
              <h3 className="text-2xl font-bold text-gray-800">ข้อมูลโภชนาการ</h3>
              <p className="text-sm text-gray-500">
                พลังงานและสารอาหารหลักต่อหนึ่งหน่วยเสิร์ฟ
              </p>
              <div className="flex gap-4 flex-wrap mt-3 items-center">
                {hasCalories ? (
                  <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-semibold">
                    {Math.round(macros.calories!.amount)} {macros.calories!.unit} แคลอรี่
                  </div>
                ) : (
                  <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm">
                    ไม่มีข้อมูลแคลอรี่
                  </div>
                )}
                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                  เสิร์ฟ {recipe.servings} ที่
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-56 w-full">
                {hasMacroData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macros.chartData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {macros.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string, props) =>
                          `${Math.round(value)} ${props.payload.unit}`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    ไม่มีข้อมูลโภชนาการ
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {hasMacroData ? (
                  macros.chartData.map((macro) => (
                    <div
                      key={macro.name}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: macro.color }}
                        />
                        <span className="font-semibold text-gray-700">
                          {macro.name}
                        </span>
                      </div>
                      <span className="text-gray-600 font-medium">
                        {Math.round(macro.value)} {macro.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    ไม่มีข้อมูลโภชนาการสำหรับเมนูนี้ (ดึงจากข้อมูลที่บันทึกไว้)
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients (วัตถุดิบ) */}
        <section className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-1">
          <h2 className="text-2xl font-bold text-orange-600 mb-5 flex items-center gap-2">
            <ChefHat /> วัตถุดิบ
          </h2>
          <ul className="space-y-3">
            {recipe.extendedIngredients.map((ing, index) => (
              <li
                key={`${ing.id}-${index}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/60"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-orange-400 shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">
                  {ing.original}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Instructions (วิธีทำ) */}
        <section className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">วิธีทำ</h2>
          <div className="space-y-5">
            {recipe.analyzedInstructions.length > 0 ? (
              recipe.analyzedInstructions[0].steps.map((step, index) => (
                <div
                  key={`${step.number}-${index}`}
                  className="flex gap-4 items-start rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-orange-100 text-orange-600 font-bold rounded-full flex items-center justify-center">
                    {step.number}
                  </div>
                  <p className="text-gray-600 leading-relaxed pt-1">
                    {step.step}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">ไม่มีข้อมูลวิธีทำสำหรับเมนูนี้</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
