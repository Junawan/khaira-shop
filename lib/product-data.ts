import type { Product } from "@/lib/types/product";

export function getProductPrice(product: Product): number {
  const variantPrices = (product.variants ?? [])
    .flatMap((variant) => variant.values ?? [])
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (variantPrices.length) return Math.min(...variantPrices);
  return Number(product.price) || 0;
}

export function getProductAvailability(
  product: Product
): "https://schema.org/InStock" | "https://schema.org/OutOfStock" | undefined {
  const initialVariant = product.variants?.[0]?.values?.[0];

  if (initialVariant) {
    if (typeof initialVariant.stock !== "number") return undefined;
    return initialVariant.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  }

  if (typeof product.stock === "number") {
    return product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  }

  return undefined;
}
