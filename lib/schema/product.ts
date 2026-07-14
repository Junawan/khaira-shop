import type { Product } from "@/lib/types/product";
import { getEffectivePrice } from "@/lib/get-effective-price";

type ProductSchemaProps = {
  product: Product;
};

export function createProductSchema({
  product,
}: ProductSchemaProps) {
  const image =
    product.images?.[0] ??
    product.image ??
    "https://www.ks25.my.id/logo.png";

    const effectivePrice =
  getEffectivePrice(product);

  console.log("SCHEMA PRICE:", effectivePrice);

  const schema = {
  "@context": "https://schema.org",

    "@type": "Product",

    name: product.name,

    image: [image],

    description:
      product.description ??
      product.name,

    sku: product.id,

    brand: {
      "@type": "Brand",
      name: "KhairaShop25",
    },

    ...(product.rating &&
    product.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",

            ratingValue: product.rating,

            reviewCount:
              product.reviewCount,
          },
        }
      : {}),

    offers: {
      "@type": "Offer",

      url: `https://www.ks25.my.id/product/${product.slug}`,

      price: effectivePrice,

  priceCurrency: "IDR",

      availability:
        "https://schema.org/InStock",

      seller: {
        "@type": "Organization",
        name: "KhairaShop25",
      },
    },
};

  console.log(
  "SCHEMA JSON:",
  JSON.stringify(schema, null, 2)
);

  return schema;
}