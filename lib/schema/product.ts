export type ProductSchemaProps = {
  product: {
    id: string;
    slug?: string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    description?: string;
  };
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

    description:
      product.description ??
      product.name,

    image: [image],

    sku: product.id,

    brand: {
      "@type": "Brand",
      name: "KhairaShop25",
    },

    offers: {
      "@type": "Offer",

      url: `https://www.ks25.my.id/product/${product.slug}`,

      price: product.price,

      priceCurrency: "IDR",

      availability:
        "https://schema.org/InStock",
    },
  };
}