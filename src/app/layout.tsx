import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import Nav from "@/components/Nav";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const orelo = localFont({
  src: '../../public/fonts/Orelo-Extended-Trial-Regular-BF674e807573e67.otf',
  variable: '--font-orelo',
});

export const metadata: Metadata = {
  title: "Sokodle - Daily Sokoban",
  description: "Sokoban puzzle every day. Push boxes and make levels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${orelo.variable} font-jetbrains antialiased`}
      >
        <div className="flex flex-col min-h-screen items-center">
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
