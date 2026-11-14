import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categorySlug } from "@/lib/category";
import { getPublicProducts } from "@/lib/public-products";
import { getProductPrice } from "@/lib/product-data";
import { SITE_URL } from "@/lib/site";

const baseUrl = SITE_URL;

export const revalidate = 300;

async function getCategory(slug: string) {
  const normalizedSlug = categorySlug(slug);
  const products = await getPublicProducts();
  const category = products.find(
    (product) => product.category && categorySlug(product.category) === normalizedSlug
  )?.category;

  return category
    ? {
        name: category,
        products: products.filter(
          (product) =>
            product.category && categorySlug(product.category) === normalizedSlug
        ),
      }
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Kategori Tidak Ditemukan | KhairaShop25",
      robots: { index: false, follow: true },
    };
  }

  const title = `${category.name} | KhairaShop25`;
  const description = `Belanja ${category.name.toLowerCase()} pilihan di KhairaShop25. Lihat produk, detail, dan harga terbaru.`;

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/kategori/${categorySlug(slug)}` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/kategori/${categorySlug(slug)}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">
      <div className="max-w-6xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-600">
          <Link href="/" className="underline">Beranda</Link>
          <span className="mx-2">/</span>
          <span>{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-gray-600 mb-6">
          Pilihan {category.name.toLowerCase()} dari KhairaShop25.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {category.products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group"
            >
              <ProductCard
                name={product.name}
                price={getProductPrice(product)}
                images={product.images}
                image={product.image}
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
