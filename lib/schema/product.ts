import { SITE_URL } from "@/lib/site";
import type { Product } from "@/lib/types/product";
import { getProductAvailability } from "@/lib/product-data";

type ProductSchemaProps = {
  product: Product;
};

export function createProductSchema({
  product,
}: ProductSchemaProps) {
  const image =
    product.images?.[0] ??
    product.image ??
    `${SITE_URL}/logo.png`;

  const initialVariantPrice = product.variants?.[0]?.values?.[0]?.price;
  const effectivePrice =
    typeof initialVariantPrice === "number" && initialVariantPrice > 0
      ? initialVariantPrice
      : product.price;
  const availability = getProductAvailability(product);

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
