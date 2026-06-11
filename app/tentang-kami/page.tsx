"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function TentangKamiPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2]">

      {/* HERO */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tentang KhairaShop25
          </h1>

          <p className="text-gray-600 text-lg leading-8">
            Produsen & toko perlengkapan baking terpercaya di Indonesia
            yang menghadirkan produk berkualitas dengan harga langsung dari pengrajin.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">

            <a
              href="https://maps.app.goo.gl/NaBPtaPCB4z4rzfW9"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              Lihat Lokasi Kami
            </a>

            <Link
              href="/"
              className="bg-white border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100 transition"
            >
              Belanja Sekarang
            </Link>

          </div>

        </div>
      </section>

      {/* STORY */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-sm space-y-6 text-gray-700 leading-8">

          <p>
            KhairaShop25 adalah toko online yang menyediakan berbagai
            perlengkapan baking, loyang, oven, dan kebutuhan dapur
            berkualitas dengan harga terjangkau.
          </p>

          <p>
            Kami merupakan pengrajin sekaligus produsen peralatan baking
            seperti loyang aluminium dan stainless steel yang diproduksi
            dengan standar kualitas tinggi.
          </p>

          <p>
            Dengan sistem produksi langsung tanpa perantara, kami dapat
            memberikan harga yang lebih murah dibanding marketplace.
          </p>

          <p>
            Produk kami digunakan oleh pelaku usaha kue, bakery, hingga
            kebutuhan rumah tangga di seluruh Indonesia.
          </p>

        </div>
      </section>

      <section className="px-6 pb-20">

  <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 shadow-sm">

    <h2 className="text-2xl font-bold mb-4">
      Workshop & Produksi Kami
    </h2>

    <p className="text-gray-600 mb-6">
      Seluruh produk KhairaShop25 diproduksi dan diproses langsung
      oleh tim kami di Bogor. Berikut beberapa dokumentasi toko,
      workshop, dan aktivitas produksi sehari-hari.
    </p>

    <Swiper
      modules={[
        Navigation,
        Pagination,
        Autoplay,
      ]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3500,
      }}
      loop
      className="rounded-2xl overflow-hidden"
    >

      {[
        "/toko-1.jpg",
        "/toko-2.jpg",
        "/produksi-1.jpg",
        "/produksi-2.jpg",
        "/produksi-3.jpg",
        "/produksi-4.jpg",
        "/produksi-5.jpg",
        "/produksi-6.jpg",
        "/produksi-7.jpg",
        "/rating-1.png",
        "/rating-2.png",
      ].map((image, index) => (

        <SwiperSlide key={index}>

          <div className="relative w-full aspect-[16/9]">

            <Image
              src={image}
              alt={`Workshop KhairaShop25 ${index + 1}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
            />

          </div>

        </SwiperSlide>

      ))}

    </Swiper>

  </div>

</section>

      {/* VALUES */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">🔥 Harga Pabrik</h3>
            <p className="text-gray-600 leading-7">
              Tanpa perantara, langsung dari pengrajin sehingga lebih hemat.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">⭐ Kualitas Premium</h3>
            <p className="text-gray-600 leading-7">
              Material aluminium & stainless steel terbaik untuk ketahanan lama.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-3">🚚 Pengiriman Cepat</h3>
            <p className="text-gray-600 leading-7">
              Pengiriman ke seluruh Indonesia dengan packing aman.
            </p>
          </div>

        </div>
      </section>

      {/* LOCATION */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-sm">

          <h2 className="text-2xl font-bold mb-4">
            Lokasi Toko
          </h2>

          <p className="text-gray-600 mb-6 leading-7">
            Jl. Raya Tajur Citeureup RT 03 RW 01, Desa Tajur,
            Kec. Citeureup, Kab. Bogor, Jawa Barat 16810
          </p>

          <div className="aspect-video w-full rounded-2xl overflow-hidden border mb-6">
            <iframe
              src="https://www.google.com/maps?q=Jl.+Raya+Tajur+Citeureup+Bogor&output=embed"
              className="w-full h-full"
              loading="lazy"
            />
          </div>

          <a
            href="https://maps.app.goo.gl/NaBPtaPCB4z4rzfW9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
          >
            Buka di Google Maps
          </a>

        </div>
      </section>

      {/* CTA WHATSAPP */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto bg-green-600 text-white rounded-3xl p-10 text-center">

          <h2 className="text-2xl font-bold mb-4">
            Butuh Bantuan atau Order Cepat?
          </h2>

          <p className="mb-6 text-white/90">
            Hubungi kami langsung melalui WhatsApp untuk respon lebih cepat.
          </p>

          <a
            href="https://wa.me/6285710255464"
            target="_blank"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            <MessageCircle size={18} />
            Chat WhatsApp
          </a>

        </div>
      </section>

    </main>
  );
}