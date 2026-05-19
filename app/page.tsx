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

      {/* PROMO BANNER */}

<section className="px-6 pt-6">

  <div className="max-w-7xl mx-auto">

    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-10 md:p-14 shadow-2xl">

      {/* blur decoration */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>

      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>

          <p className="uppercase tracking-[0.3em] text-white/80 text-sm font-semibold mb-4">

            Belanja Lebih Hemat

          </p>

          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">

            Harga Lebih Murah
            Dari Marketplace

          </h2>

          <p className="mt-6 text-white/90 text-lg leading-8 max-w-xl">

            Nikmati pengalaman belanja langsung tanpa biaya admin,
            tanpa biaya layanan, dan harga lebih hemat untuk semua
            perlengkapan baking favorit Anda.

          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <div className="bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-white font-medium">

              ✅ Tanpa Biaya Admin

            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-white font-medium">

              ✅ Harga Lebih Murah

            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-white font-medium">

              ✅ Pengiriman Cepat

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex justify-center">

          <img
            src="/logo-banner.png"
            alt="KhairaShop25"
            className="w-72 md:w-96 drop-shadow-2xl"
          />

        </div>

      </div>

    </div>

  </div>

</section>

      {/* HERO */}

      <section className="px-6 py-24 text-center">

        <div className="max-w-4xl mx-auto">

          <p className="text-green-700 font-semibold mb-4 tracking-widest uppercase">
            KhairaShop25
          </p>

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