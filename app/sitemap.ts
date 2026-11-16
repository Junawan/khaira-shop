import type { MetadataRoute } from "next";
import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";
import { SITE_URL } from "@/lib/site";

// Refresh the product and category URLs as the public catalog changes.
export const revalidate = 300;

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

  return [...publicPages, ...categoryPages, ...productPages];
}
