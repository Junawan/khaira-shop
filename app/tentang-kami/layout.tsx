import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang KhairaShop25 | Produsen Peralatan Baking di Bogor",
  description:
    "Kenali KhairaShop25, produsen dan toko perlengkapan baking, loyang, serta alat dapur di Citeureup, Bogor.",
  alternates: { canonical: "/tentang-kami" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
