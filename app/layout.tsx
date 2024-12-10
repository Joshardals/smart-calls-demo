import type { Metadata } from "next";
import { Lora, Roboto } from "next/font/google";

import "./globals.css";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";

import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Intro to Smart Contracts",
  description:
    "A decentralized smart contract enabling trustless, transparent, and automated transactions on the blockchain",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-lora",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${lora.variable} antialiased`}>
        <Header />
        <div className="min-h-screen">{children}</div>
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
