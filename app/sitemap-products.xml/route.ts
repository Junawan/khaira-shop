import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const baseUrl = "https://www.ks25.my.id";

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");

  const limit = 200;
  const offset = (page - 1) * limit;

  const snapshot = await adminDb
    .collection("products")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .offset(offset)
    .get();

  const products = snapshot.docs
    .map((doc) => doc.data())
    .filter((p) => p.slug)
    .map(
      (p) => `
<url>
  <loc>${baseUrl}/product/${p.slug}</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
</url>`
    );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${products.join("")}

</urlset>`;

  return new NextResponse(xml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}