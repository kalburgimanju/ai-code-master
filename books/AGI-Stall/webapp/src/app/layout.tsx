import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AGI: The Complete Guide to Artificial General Intelligence",
  description:
    "A comprehensive guide to understanding, developing, and building a career in Artificial General Intelligence by Manjunath Kalburgi",
  keywords: [
    "AGI",
    "Artificial General Intelligence",
    "AI",
    "Machine Learning",
    "Deep Learning",
    "Manjunath Kalburgi",
  ],
  authors: [{ name: "Manjunath Kalburgi" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
