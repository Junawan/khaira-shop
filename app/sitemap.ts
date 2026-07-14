import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ks25.my.id";

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
  ];
}