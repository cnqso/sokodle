import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";

const bodyFont = localFont({
  src: "../../public/fonts/nunitosans-variable.ttf",
  weight: "200 900",
  variable: "--font-body",
  display: "swap",
});

const displayFont = localFont({
  src: "../../public/fonts/dynapuff-variable.ttf",
  weight: "400 700",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sokodle - Daily Sokoban",
  description: "A new Sokoban puzzle every day. Guide carrots into bowls and make your own levels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <div className="flex flex-col min-h-screen items-center">
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
