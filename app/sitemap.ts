import type { MetadataRoute } from "next";

import { adminDb } from "@/lib/firebase-admin";

function asDate(value: unknown): Date | undefined {
  if (value && typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.ks25.my.id";

  const snapshot = await adminDb.collection("products").get();
  const products = snapshot.docs
    .map((doc) => doc.data())
    .filter((product) => product.slug)
    .map((product) => {
      const lastModified = asDate(product.updatedAt);

      return {
        url: `${baseUrl}/product/${product.slug}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    { url: `${baseUrl}/tentang-kami` },
    { url: `${baseUrl}/kebijakan-privasi` },
    { url: `${baseUrl}/syarat-ketentuan` },
    ...products,
  ];
}
