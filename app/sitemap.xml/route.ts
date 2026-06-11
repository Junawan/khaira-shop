import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

export async function GET() {
  const baseUrl =
    "https://www.ks25.my.id";

  const snapshot = await getDocs(
    collection(db, "products")
  );

  const products = snapshot.docs
  .map((doc) => doc.data())
  .filter((product) => product.slug)
  .map(
    (product) => `
      <url>
        <loc>${baseUrl}/product/${product.slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>${baseUrl}</loc>
</url>

<url>
<loc>${baseUrl}/tentang-kami</loc>
</url>

<url>
<loc>${baseUrl}/kebijakan-privasi</loc>
</url>

<url>
<loc>${baseUrl}/syarat-ketentuan</loc>
</url>

${products.join("")}

</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type":
        "application/xml",
    },
  });
}