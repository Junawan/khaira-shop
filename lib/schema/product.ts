import type { Product } from "@/lib/types/product";

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

  return {
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

      price: product.price,

      priceCurrency: "IDR",

      availability:
        "https://schema.org/InStock",

      seller: {
        "@type": "Organization",
        name: "KhairaShop25",
      },
    },
  };
}