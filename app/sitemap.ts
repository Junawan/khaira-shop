import { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const snapshot = await adminDb
    .collection("products")
    .get();

  const products = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      url: `https://www.ks25.my.id/product/${data.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    };
  });

  return [
    {
      url: "https://www.ks25.my.id",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: "https://www.ks25.my.id/tentang-kami",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    ...products,
  ];
}