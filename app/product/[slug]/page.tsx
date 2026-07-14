import { notFound } from "next/navigation";

import ProductDetailClient from "./ProductDetailClient";

import { getProductBySlug } from "@/lib/product";
import { Metadata } from "next";
/*
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | KhairaShop25",
    };
  }

  const image =
    product.images?.[0] ??
    product.image ??
    "/logo.png";

  const title = `${product.name} | KhairaShop25`;

  const description =
    product.description ??
    `${product.name} tersedia di KhairaShop25.`;

  const url =
    `https://www.ks25.my.id/product/${product.slug}`;

  return {
    title,

    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      type: "website",

      images: [
        {
          url: image,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      images: [image],
    },
  };
}
  */

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

return (
  <pre>
    {JSON.stringify(product, null, 2)}
  </pre>
);
}