import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const products = await getPublicProducts();
  const categories = new Set(
    products
      .map((product) => product.category?.trim())
      .filter((category): category is string => Boolean(category))
      .map(categorySlug)
      .filter(Boolean)
  );

  const urls = new Set([
    SITE_URL,
    `${SITE_URL}/tentang-kami`,
    `${SITE_URL}/kebijakan-privasi`,
    `${SITE_URL}/syarat-ketentuan`,
    ...Array.from(categories, (slug) => `${SITE_URL}/kategori/${slug}`),
    ...products
      .map((product) => product.slug?.trim())
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => `${SITE_URL}/product/${encodeURIComponent(slug)}`),
  ]);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...Array.from(urls, (url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
  ].join("\n");
  const body = new TextEncoder().encode(xml);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
