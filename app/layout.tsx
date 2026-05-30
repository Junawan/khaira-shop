import "./globals.css";

import {
  AuthProvider,
} from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body>

        <AuthProvider>
          {children}
        </AuthProvider>

      </body>

    </html>
  );
}

export const metadata = {

  title:
    "KhairaShop25 - Loyang & Peralatan Baking",

  description:
    "Toko online loyang, peralatan baking, cetakan kue, perlengkapan dapur dan usaha bakery dengan harga murah.",

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
    title:
      "KhairaShop25",
    description:
      "Toko online perlengkapan baking dan usaha kuliner",

    url:
      "https://www.ks25.my.id",

    siteName:
      "KhairaShop25",

    images: [
      {
        url: "/logo.png",
      },
    ],

    locale: "id_ID",

    type: "website",
  },

};