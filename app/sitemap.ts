import type { MetadataRoute } from "next";
import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";
import { SITE_URL } from "@/lib/site";

// Cache the generated XML for one hour so requests do not query Firestore each time.
export const revalidate = 3600;

const generatedAt = "2026-11-17T09:14:02.000Z";
const submittedUrls: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: generatedAt, priority: 1 },
  {
    url: `${SITE_URL}/product/loyang-pai-sus-bongkar-pasang-aluminium-diameter-14-16-18-20-22-24-cm-tebal-0-4-dan-0-6-mm-cseeorN3xXz0RDe4vVo1`,
    lastModified: generatedAt,
    priority: 0.8,
  },
  { url: `${SITE_URL}/tentang-kami`, lastModified: generatedAt, priority: 0.8 },
  { url: `${SITE_URL}/kebijakan-privasi`, lastModified: generatedAt, priority: 0.8 },
  { url: `${SITE_URL}/syarat-ketentuan`, lastModified: generatedAt, priority: 0.8 },
  { url: `${SITE_URL}/kategori/loyang`, lastModified: generatedAt, priority: 0.64 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tentang-kami`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/kebijakan-privasi`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/syarat-ketentuan`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

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

  const categoryPages: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${SITE_URL}/kategori/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${encodeURIComponent(product.slug!)}`,
    changeFrequency: "weekly",
    priority: 0.8,
    images: Array.from(new Set([product.image, ...(product.images ?? [])]))
      .filter((image): image is string => Boolean(image))
      .filter((image) => /^https?:\/\//i.test(image)),
  }));

  const urls = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...publicPages, ...categoryPages, ...productPages, ...submittedUrls]) {
    urls.set(entry.url, { ...urls.get(entry.url), ...entry });
  }

  return Array.from(urls.values());
}
