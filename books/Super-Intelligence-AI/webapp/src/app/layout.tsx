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
  title: "Super Intelligence AI: The Complete Guide",
  description:
    "A comprehensive guide to understanding, building, and controlling the future of intelligence by Manjunath Kalburgi",
  keywords: [
    "Superintelligence",
    "Super Intelligence AI",
    "AI",
    "Artificial Intelligence",
    "Machine Learning",
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
