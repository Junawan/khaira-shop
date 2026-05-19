"use client";

import Navbar from "@/components/Navbar";

import ProductCard from "@/components/ProductCard";

import Link from "next/link";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type Product = {
  id: string;

  name: string;

  price: number;

  image?: string;

  description?: string;

  variants?: {
    name: string;

    price: number;
  }[];
};

export default function Home() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot =
          await getDocs(
            collection(db, "products")
          );

        const data: Product[] =
          querySnapshot.docs.map((doc) => ({
            id: doc.id,

            ...(doc.data() as Omit<
              Product,
              "id"
            >),
          }));

        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf7f2]">

      <Navbar />

      {/* HERO */}

      <section className="px-6 py-24 text-center">

        <div className="max-w-4xl mx-auto">

          <p className="text-green-700 font-semibold mb-4 tracking-widest uppercase">
            KhairaShop25
          </p>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">

            Peralatan Baking
            Terlengkap Untuk
            Dapur Impian Anda

          </h1>

          <p className="mt-8 text-gray-600 text-lg md:text-xl leading-8 max-w-2xl mx-auto">

            Temukan loyang premium,
            alat baking berkualitas,
            dan perlengkapan dapur terbaik
            dengan harga terjangkau.

          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">

            <a
              href="#products"
              className="bg-black text-white px-8 py-4 rounded-2xl hover:opacity-90 transition"
            >
              Belanja Sekarang
            </a>

            <a
              href="/cart"
              className="bg-white border border-gray-300 px-8 py-4 rounded-2xl hover:bg-gray-100 transition"
            >
              Lihat Keranjang
            </a>

          </div>

        </div>

      </section>

      {/* PRODUCTS */}

      <section
        id="products"
        className="px-6 pb-24"
      >

        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">

            <div>

              <h2 className="text-4xl font-bold text-gray-900">

                Produk Unggulan

              </h2>

              <p className="text-gray-500 mt-2">
                Koleksi pilihan terbaik
                untuk kebutuhan baking Anda
              </p>

            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Memuat produk...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-gray-500 shadow-sm">
              Belum ada produk
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {products.map((product) => {

                const finalPrice =
                  product.variants &&
                  product.variants.length > 0
                    ? product.variants[0].price
                    : product.price;

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group"
                  >

                    <div className="transform transition duration-300 group-hover:-translate-y-2">

                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={finalPrice}
                        image={product.image}
                      />

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </div>

      </section>

      {/* BENEFITS */}

      <section className="px-6 pb-24">

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <h3 className="text-xl font-bold mb-3">
              Produk Berkualitas
            </h3>

            <p className="text-gray-600 leading-7">
              Peralatan baking pilihan
              dengan material premium
              dan tahan lama.
            </p>

          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <h3 className="text-xl font-bold mb-3">
              Pengiriman Cepat
            </h3>

            <p className="text-gray-600 leading-7">
              Terintegrasi berbagai
              ekspedisi dengan ongkir realtime.
            </p>

          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <h3 className="text-xl font-bold mb-3">
              Pembayaran Aman
            </h3>

            <p className="text-gray-600 leading-7">
              Mendukung QRIS,
              Virtual Account,
              dan e-wallet.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
  // redeploy trigger
}