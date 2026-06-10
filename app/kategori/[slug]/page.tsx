"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  image?: string;
  price: number;
  slug: string;
  category?: string;
};

export default function CategoryPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const getLowestPrice = (product: any) => {
  if (product?.variants?.length > 0) {
    const allPrices = product.variants.flatMap((v: any) =>
      v.values.map((val: any) => val.price)
    );

    return Math.min(...allPrices);
  }

  return product.price || 0;
};

  useEffect(() => {
    if (!slug) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const snapshot = await getDocs(collection(db, "products"));

        const data: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data();

          return {
            id: doc.id,
            name: d.name || "",
            slug: d.slug || "",
            image: d.image || "",
            price: d.price || 0,
            category: d.category || "",
            variants: d.variants || [],
          };
        });

        const filtered = data.filter((p) => {
          const productCategory = (p.category || "")
            .trim()
            .toLowerCase();

          const currentSlug = slug.trim().toLowerCase();

          return productCategory === currentSlug;
        });

        setProducts(filtered);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Kategori:{" "}
          {slug.charAt(0).toUpperCase() + slug.slice(1)}
        </h1>

        {products.length === 0 ? (
          <p className="text-gray-500">
            Tidak ada produk di kategori ini
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${encodeURIComponent(product.slug)}`}
                className="bg-white rounded-2xl p-3 shadow-sm"
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>

                <h2 className="mt-2 font-semibold text-sm">
                  {product.name}
                </h2>

                <p className="text-green-600 font-bold">
  Rp {getLowestPrice(product).toLocaleString()}
</p>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}