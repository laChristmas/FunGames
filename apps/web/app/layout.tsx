import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunGames",
  description: "网页小游戏合集",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
