import type { Product } from "@/lib/types/product";

export function getEffectivePrice(product: Product): number {
  if (product.price > 0) {
    return product.price;
  }

  const values = product.variants?.[0]?.values ?? [];

  const prices = values.map((v) => v.price);

  const minPrice =
    prices.length > 0
      ? Math.min(...prices)
      : 0;

  return minPrice;
}
