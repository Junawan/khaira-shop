import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ks25.my.id"),

  title: "KhairaShop25 - Loyang & Peralatan Baking",

  description:
    "Toko online loyang, peralatan baking, cetakan kue, perlengkapan dapur dan usaha bakery dengan harga murah.",

  alternates: {
    canonical: "/",
  },

  verification: {
    google: "lYnSkEZf3Gi2djxhSXGAInSWJ7tIXcsr6wKwMc4azD0",
  },

  keywords: [
    "loyang",
    "loyang brownies",
    "loyang kue",
    "oven",
    "klakat",
    "kukusan",
    "loyang roti",
    "peralatan baking",
    "alat bakery",
    "cetakan kue",
    "khairashop25",
  ],

  openGraph: {
    title: "KhairaShop25",
    description:
      "Toko online perlengkapan baking dan usaha kuliner",
    url: "https://www.ks25.my.id",
    siteName: "KhairaShop25",
    images: [
      {
        url: "/logo.png",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <GoogleAnalytics gaId="G-T41M3WJYL9" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}