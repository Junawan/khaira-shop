import { notFound } from "next/navigation";

import ProductDetailClient from "./ProductDetailClient";

import { getProductBySlug } from "@/lib/product";
import { Metadata } from "next";
import { createProductSchema } from "@/lib/schema/product";
import { createBreadcrumbSchema } from "@/lib/schema/breadcrumb";
import { SITE_URL } from "@/lib/site";

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
      robots: { index: false, follow: true },
    };
  }

  const image =
    product.image ||
    product.images?.[0] ||
    `${SITE_URL}/logo.png`;

  const url = `${SITE_URL}/product/${product.slug}`;
  const description =
    product.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${product.name} tersedia di KhairaShop25.`;

  return {
    title: `${product.name} | KhairaShop25`,

    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: "website",
      url,
      title: product.name,
      description,
      images: [
        {
          url: image,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
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
      url: SITE_URL,
    },

    {
      name: "Produk",
      url: SITE_URL,
    },

    {
      name: product.name,
      url: `${SITE_URL}/product/${product.slug}`,
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
