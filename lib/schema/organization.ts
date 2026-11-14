import { SITE_URL } from "@/lib/site";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "Store"],

  name: "KhairaShop25",

  url: SITE_URL,

  logo: `${SITE_URL}/logo.png`,

  description:
    "KhairaShop25 menyediakan perlengkapan baking, loyang, cetakan kue, dan peralatan dapur berkualitas.",

  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Raya Tajur Citeureup RT 03 RW 01, Desa Tajur",
    addressLocality: "Kabupaten Bogor",
    addressRegion: "Jawa Barat",
    postalCode: "16810",
    addressCountry: "ID",
  },

  telephone: "+6285710255464",
  email: "khairashop25@gmail.com",
  sameAs: ["https://maps.app.goo.gl/NaBPtaPCB4z4rzfW9"],
};
