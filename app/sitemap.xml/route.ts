import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  const baseUrl = "https://www.ks25.my.id";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<sitemap>
  <loc>${baseUrl}/sitemap-pages.xml</loc>
</sitemap>

<sitemap>
  <loc>${baseUrl}/sitemap-products-1.xml</loc>
</sitemap>

</sitemapindex>`;

  return new NextResponse(xml.trim(), {
  headers: {
    "Content-Type": "application/xml; charset=utf-8",

    // 🔥 penting: MATIKAN CACHE
    "Cache-Control": "no-store, no-cache, must-revalidate",
  },
});
}