import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://www.ks25.my.id";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

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

</urlset>`;

  return new NextResponse(xml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}