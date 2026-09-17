import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Settlla | Verified Kaduna Apartments with All-In Pricing",
  description: "Find and secure verified residential apartments in Barnawa and Malali, Kaduna with transparent all-in pricing and zero inspection fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F8FAFC] text-slate-900 min-h-screen selection:bg-blue-600 selection:text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
