import { MetadataRoute } from "next";

import { adminDb } from "@/lib/firebase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.ks25.my.id";

  const snapshot = await adminDb
    .collection("products")
    .get();

  const products = snapshot.docs
    .map((doc) => doc.data())
    .filter((product) => product.slug)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
    },

    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: new Date(),
    },

    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: new Date(),
    },

    ...products,
  ];
}