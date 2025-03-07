import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const orelo = localFont({
  src: '../../public/fonts/Orelo-Extended-Trial-Regular-BF674e807573e67.otf',
  variable: '--font-orelo',
});

export const metadata: Metadata = {
  title: "Sokodle - Daily Sokoban Puzzle",
  description: "A new Sokoban puzzle every day. Push boxes, solve puzzles, share your solutions!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} ${orelo.variable} font-mono antialiased`}
      >
        <div className="flex flex-col min-h-screen items-center">
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
