import type { Metadata } from "next";
import Link from "next/link";
import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";

export const metadata: Metadata = {
  title: "Peta Situs | KhairaShop25",
  description: "Jelajahi halaman, kategori, dan produk di KhairaShop25.",
  alternates: { canonical: "/sitemap" },
};

export const revalidate = 300;

export default async function SitemapPage() {
  const products = await getPublicProducts();
  const categories = Array.from(
    new Map(
      products
        .map((product) => product.category?.trim())
        .filter((category): category is string => Boolean(category))
        .map((category) => [categorySlug(category), category] as const)
        .filter(([slug]) => Boolean(slug))
    )
  );

  return (
    <main className="min-h-screen bg-[#faf7f2] px-6 py-12 text-gray-900 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
          ← Kembali ke beranda
        </Link>

        <header className="mb-10 mt-6 rounded-3xl bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            KhairaShop25
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">Peta Situs</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-600">
            Temukan halaman informasi, kategori, dan produk yang tersedia di toko kami.
          </p>
        </header>

        <nav aria-label="Struktur situs" className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
          <ul className="space-y-7">
            <li>
              <Link className="text-lg font-bold hover:text-orange-700" href="/">
                Beranda
              </Link>
              <ul className="mt-4 space-y-3 border-l-2 border-orange-100 pl-5">
                <li><Link className="hover:text-orange-700" href="/tentang-kami">Tentang KhairaShop25</Link></li>
                <li><Link className="hover:text-orange-700" href="/kebijakan-privasi">Kebijakan Privasi</Link></li>
                <li><Link className="hover:text-orange-700" href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link></li>
                <li><Link className="hover:text-orange-700" href="/account">Akun pelanggan</Link></li>
                <li>
                  <span className="font-semibold">Kategori</span>
                  <ul className="mt-2 space-y-2 border-l-2 border-orange-100 pl-5">
                    {categories.map(([slug, name]) => (
                      <li key={slug}><Link className="hover:text-orange-700" href={`/kategori/${slug}`}>{name}</Link></li>
                    ))}
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">Produk</span>
                  <ul className="mt-2 space-y-2 border-l-2 border-orange-100 pl-5">
                    {products.map((product) => (
                      <li key={product.id}>
                        <Link className="hover:text-orange-700" href={`/product/${encodeURIComponent(product.slug!)}`}>
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
