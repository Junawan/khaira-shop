import { MetadataRoute } from "next";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const baseUrl =
    "https://www.ks25.my.id";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      priority: 0.5,
    },
  ];

  const snapshot =
    await getDocs(
      collection(db, "products")
    );

  const productPages =
    snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        url: `${baseUrl}/product/${data.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      };
    });

  return [
    ...staticPages,
    ...productPages,
  ];
}