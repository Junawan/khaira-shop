import type { Product } from "@/lib/types/product";

export function getEffectivePrice(product: Product): number {
  if (product.price > 0) {
    return product.price;
  }

  const values = product.variants?.[0]?.values ?? [];

  console.log("VALUES:", values);

  const prices = values.map((v) => v.price);

  console.log("PRICES:", prices);

  const minPrice =
    prices.length > 0
      ? Math.min(...prices)
      : 0;

  console.log("MIN PRICE:", minPrice);

  return minPrice;
}