import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {

  return [
    {
      url: "https://www.ks25.my.id",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: "https://www.ks25.my.id/cart",
      lastModified: new Date(),
      priority: 0.8,
    },

    {
      url: "https://www.ks25.my.id/tentang-kami",
      lastModified: new Date(),
      priority: 0.8,
    },
  ];

}