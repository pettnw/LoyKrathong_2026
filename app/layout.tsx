import type { Metadata } from "next";
import { Mali, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const mali = Mali({
  variable: "--font-mali",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ลอยกระทงออนไลน์ | Loy Krathong",
  description:
    "ลอยกระทงออนไลน์ เลือกกระทงสวยๆ เขียนคำอธิษฐาน แล้วปล่อยให้ลอยไปกับสายน้ำยามค่ำคืน",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${mali.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#050818] text-slate-100">
        {children}
      </body>
    </html>
  );
}
