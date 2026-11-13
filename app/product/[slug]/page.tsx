import { notFound } from "next/navigation";

import ProductDetailClient from "./ProductDetailClient";

import { getProductBySlug } from "@/lib/product";
import { Metadata } from "next";
import { createProductSchema } from "@/lib/schema/product";
import { createBreadcrumbSchema } from "@/lib/schema/breadcrumb";

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
    product.images?.[0] ||
    product.image ||
    "https://www.ks25.my.id/logo.png";

  const url = `https://www.ks25.my.id/product/${product.slug}`;

  return {
    title: `${product.name} | KhairaShop25`,

    description:
      product.description?.slice(0, 160) ??
      `${product.name} tersedia di KhairaShop25.`,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: "website",
      url,
      title: product.name,
      description:
        product.description?.slice(0, 160),
      images: [
        {
          url: image,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: product.name,
      description:
        product.description?.slice(0, 160),
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const schema = createProductSchema({
  product,
});

const breadcrumbSchema =
  createBreadcrumbSchema([
    {
      name: "Beranda",
      url: "https://www.ks25.my.id",
    },

    {
      name: "Produk",
      url: "https://www.ks25.my.id",
    },

    {
      name: product.name,
      url: `https://www.ks25.my.id/product/${product.slug}`,
    },
  ]);

  return (
    <>
  <script
    id="product-schema"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
    }}
  />

  <script
    id="breadcrumb-schema"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
    }}
  />

  <ProductDetailClient
    initialProduct={product}
  />
</>
  );
}
