import { cache } from "react";
import { adminDb } from "@/lib/firebase-admin";
import { createProductSlug } from "@/lib/product-slug";
import type { Product } from "@/lib/types/product";

export type PublicProduct = Product & {
  active: boolean;
};

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export const getPublicProducts = cache(async (): Promise<PublicProduct[]> => {
  const snapshot = await adminDb.collection("products").get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const variants = Array.isArray(data.variants)
        ? data.variants.map((variant: any) => ({
            name: String(variant?.name ?? ""),
            values: Array.isArray(variant?.values)
              ? variant.values.map((value: any) => ({
                  value: String(value?.value ?? ""),
                  price: optionalNumber(value?.price) ?? 0,
                  stock: optionalNumber(value?.stock),
                }))
              : [],
          }))
        : [];
      const image =
        typeof data.image === "string" && data.image.trim()
          ? data.image
          : undefined;

      return {
        id: doc.id,
        active: data.active === true,
        slug:
          typeof data.slug === "string" && data.slug.trim()
            ? data.slug.trim()
            : createProductSlug(
                typeof data.name === "string" ? data.name : "",
                doc.id
              ),
        name: typeof data.name === "string" ? data.name : "",
        price: optionalNumber(data.price) ?? 0,
        image,
        images: image
          ? [image]
          : Array.isArray(data.images)
            ? data.images.filter((item: unknown): item is string => typeof item === "string")
            : undefined,
        description:
          typeof data.description === "string" ? data.description : undefined,
        variants,
        weight: optionalNumber(data.weight),
        length: optionalNumber(data.length),
        width: optionalNumber(data.width),
        height: optionalNumber(data.height),
        rating: optionalNumber(data.rating),
        reviewCount: optionalNumber(data.reviewCount),
        category: typeof data.category === "string" ? data.category : undefined,
        stock: optionalNumber(data.stock),
        displayOrder: optionalNumber(data.displayOrder),
      } satisfies PublicProduct;
    })
    .filter((product) => product.active && Boolean(product.name.trim()));
});

