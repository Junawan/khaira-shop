import HomeClient from "./HomeClient";
import { getPublicProducts } from "@/lib/public-products";
import { getProductPrice } from "@/lib/product-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 300;

export default async function HomePage() {
  const publicProducts = await getPublicProducts();
  const products = publicProducts.map((product) => ({
    id: product.id,
    slug: product.slug!,
    name: product.name,
    price: getProductPrice(product),
    image: product.image || product.images?.[0],
  }));
  const categories = Array.from(
    new Set(
      publicProducts
        .map((product) => product.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  );
  return <HomeClient products={products} categories={categories} />;
}
