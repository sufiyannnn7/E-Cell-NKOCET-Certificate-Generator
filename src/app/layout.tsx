import type { Metadata } from "next";
import { Inter, Montserrat, Great_Vibes } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-cursive",
});

export const metadata: Metadata = {
  title: "E-Cell NKOCET | Certificate System",
  description: "Certificate Management & Verification System for E-Cell NKOCET",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${greatVibes.variable}`}>
      <body className="antialiased min-h-screen bg-gray-50 text-navy">
        {children}
      </body>
    </html>
  );
}
