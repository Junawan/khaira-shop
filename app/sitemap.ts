import type { MetadataRoute } from "next";
import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.ks25.my.id";
  const products = await getPublicProducts();
  const categoryMap = new Map<string, string>();
  for (const product of products) {
    if (!product.category?.trim()) continue;
    const slug = categorySlug(product.category);
    if (slug) categoryMap.set(slug, product.category);
  }
  const categories = Array.from(categoryMap.keys());

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tentang-kami`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/kebijakan-privasi`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/syarat-ketentuan`, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((slug) => ({
      url: `${baseUrl}/kategori/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
