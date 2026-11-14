import type { MetadataRoute } from "next";
import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  let products: Awaited<ReturnType<typeof getPublicProducts>>;
  try {
    products = await getPublicProducts();
  } catch (error) {
    console.error("[sitemap] Gagal mengambil produk publik dari Firestore; sitemap hanya berisi halaman statis.", error);
    products = [];
  }

  const categoryMap = new Map<string, string>();
  for (const product of products) {
    if (!product.category?.trim()) continue;
    const slug = categorySlug(product.category);
    if (slug) categoryMap.set(slug, product.category);
  }

  const categories = Array.from(categoryMap.keys());

  const uniqueProducts = new Map<string, (typeof products)[number]>();
  const duplicateSlugs = new Set<string>();
  for (const product of products) {
    const slug = product.slug?.trim();
    if (!slug) continue;
    if (uniqueProducts.has(slug)) {
      uniqueProducts.delete(slug);
      duplicateSlugs.add(slug);
      continue;
    }
    if (!duplicateSlugs.has(slug)) uniqueProducts.set(slug, product);
  }
  if (duplicateSlugs.size) {
    console.error(`[sitemap] ${duplicateSlugs.size} slug produk duplikat tidak dimasukkan: ${Array.from(duplicateSlugs).join(", ")}`);
  }

  const publicPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tentang-kami`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/kebijakan-privasi`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/syarat-ketentuan`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((slug) => ({
      url: `${baseUrl}/kategori/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = Array.from(uniqueProducts.values()).map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
  }));

  console.info(`[sitemap] Dibuat: ${publicPages.length + categoryPages.length + productPages.length} URL; ${productPages.length} produk aktif unik, ${categoryPages.length} kategori.`);

  return [...publicPages, ...categoryPages, ...productPages];
}
