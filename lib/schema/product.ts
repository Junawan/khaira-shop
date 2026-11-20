import { SITE_URL } from "@/lib/site";
import type { Product } from "@/lib/types/product";
import { getProductAvailability, getProductPrice } from "@/lib/product-data";

type ProductSchemaProps = {
  product: Product;
};

export function createProductSchema({
  product,
}: ProductSchemaProps) {
  const image =
    product.image ??
    product.images?.[0] ??
    `${SITE_URL}/logo.png`;

  const effectivePrice = getProductPrice(product);
  const availability = getProductAvailability(product);
  const reviewCount = product.reviewCount;
  const rating = product.rating;

  const schema = {
  "@context": "https://schema.org",

    "@type": "Product",

    name: product.name,

    image: [image],

    description: product.description?.trim() || product.name,

    sku: product.id,

    brand: {
      "@type": "Brand",
      name: "KhairaShop25",
    },

    ...(reviewCount && reviewCount > 0 && rating && rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(rating.toFixed(2)),
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),

    offers: {
      "@type": "Offer",

      url: `${SITE_URL}/product/${product.slug}`,

      price: effectivePrice,

      priceCurrency: "IDR",

      ...(availability ? { availability } : {}),

      seller: {
        "@type": "Organization",
        name: "KhairaShop25",
      },
    },
};

  return schema;
}
