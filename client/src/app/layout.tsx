

import type { Metadata } from "next";
// 1. นำเข้า Kanit จาก next/font/google
import { Kanit } from "next/font/google"; 
import "./globals.css";
import Providers from "./providers";

// 2. ตั้งค่าฟอนต์
const kanit = Kanit({
  subsets: ["thai", "latin"], // สำคัญมาก! ต้องใส่ thai เพื่อให้สระไม่ลอย
  weight: ["300", "400", "500", "600", "700"], // เลือกความหนาที่ต้องการ
  variable: "--font-kanit", // ตั้งชื่อตัวแปรเพื่อส่งให้ Tailwind
});

export const metadata: Metadata = {
  title: "Pongsapak Kitchen",
  description: "ค้นหาเมนูอาหารจากวัตถุดิบในตู้เย็น",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} ${kanit.className}`}>
      {/* 3. ใช้ตัวแปรฟอนต์ + utility font-sans */}
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
