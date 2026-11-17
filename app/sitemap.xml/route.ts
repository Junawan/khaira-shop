import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
  images?: string[];
};

const submittedAt = "2026-11-17T09:14:02.000Z";
const submittedEntries: SitemapEntry[] = [
  { url: SITE_URL, lastModified: submittedAt, priority: 1 },
  {
    url: `${SITE_URL}/product/loyang-pai-sus-bongkar-pasang-aluminium-diameter-14-16-18-20-22-24-cm-tebal-0-4-dan-0-6-mm-cseeorN3xXz0RDe4vVo1`,
    lastModified: submittedAt,
    priority: 0.8,
  },
  { url: `${SITE_URL}/tentang-kami`, lastModified: submittedAt, priority: 0.8 },
  { url: `${SITE_URL}/kebijakan-privasi`, lastModified: submittedAt, priority: 0.8 },
  { url: `${SITE_URL}/syarat-ketentuan`, lastModified: submittedAt, priority: 0.8 },
  { url: `${SITE_URL}/kategori/loyang`, lastModified: submittedAt, priority: 0.64 },
];

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
  const categories = Array.from(
    new Set(
      products
        .map((product) => product.category?.trim())
        .filter((category): category is string => Boolean(category))
        .map(categorySlug)
        .filter(Boolean)
    )
  );

  const entries: SitemapEntry[] = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tentang-kami`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/kebijakan-privasi`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/syarat-ketentuan`, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((slug) => ({
      url: `${SITE_URL}/kategori/${slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/product/${encodeURIComponent(product.slug!)}`,
      changeFrequency: "weekly",
      priority: 0.8,
      images: Array.from(new Set([product.image, ...(product.images ?? [])]))
        .filter((image): image is string => Boolean(image))
        .filter((image) => /^https?:\/\//i.test(image)),
    })),
    ...submittedEntries,
  ];

  const uniqueEntries = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    uniqueEntries.set(entry.url, { ...uniqueEntries.get(entry.url), ...entry });
  }

  const xmlEntries = Array.from(uniqueEntries.values()).map((entry) => {
    const fields = [
      `<loc>${escapeXml(entry.url)}</loc>`,
      ...(entry.lastModified ? [`<lastmod>${escapeXml(entry.lastModified)}</lastmod>`] : []),
      ...(entry.images ?? []).map(
        (image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`
      ),
      ...(entry.changeFrequency ? [`<changefreq>${entry.changeFrequency}</changefreq>`] : []),
      ...(entry.priority !== undefined ? [`<priority>${entry.priority.toFixed(1)}</priority>`] : []),
    ];

    return `  <url>${fields.map((field) => `\n    ${field}`).join("")}\n  </url>`;
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...xmlEntries,
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
