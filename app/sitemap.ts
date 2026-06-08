import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.ks25.my.id",
      lastModified: new Date(),
    },

    {
      url: "https://www.ks25.my.id/tentang-kami",
      lastModified: new Date(),
    },
  ];
}