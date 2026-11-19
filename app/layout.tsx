import type { Metadata } from "next";
import { Fredoka, Press_Start_2P } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-body" });
const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Tic·Tac·Glow",
  description: "A neon two-player tic-tac-toe game built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${pixel.variable}`}>{children}</body>
    </html>
  );
}
