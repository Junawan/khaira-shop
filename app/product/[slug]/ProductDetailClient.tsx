"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useCartStore } from "@/store/cart";

import {
  MessageCircle,
} from "lucide-react";

import { Star } from "lucide-react";

import Link from "next/link";
import { getEffectivePrice } from "@/lib/get-effective-price";
import type { Product } from "@/lib/types/product";

type VariantValue = {
  value: string;

  price: number;

  stock?: number;
};

type Variant = {
  name: string;

  values: VariantValue[];
};

type Review = {
  id: string;
  customerName: string;
  rating: number;
  review: string;
};

type ProductDetailClientProps = {
  initialProduct: Product;
};

export default function ProductDetailClient({
  initialProduct,
}: ProductDetailClientProps) {

  const [reviews, setReviews] =
  useState<Review[]>([]);

const [avgRating, setAvgRating] =
  useState(0);
  const params = useParams();

  const router = useRouter();

  const addToCart =
    useCartStore(
      (state) => state.addToCart
    );

  const [product, setProduct] =
  useState<Product | null>(initialProduct);

  const [loading, setLoading] =
  useState(false);

  const [
  selectedVariant,
  setSelectedVariant,
] = useState<VariantValue | null>(null);

  const [quantity, setQuantity] =
    useState(1);

    const [
  selectedImage,
  setSelectedImage,
] = useState("");

  useEffect(() => {
  const fetchReviews = async () => {
    if (!initialProduct.id) return;

    try {
      const reviewQuery = query(
        collection(db, "reviews"),
        where("productId", "==", initialProduct.id)
      );

      const reviewSnapshot = await getDocs(reviewQuery);

      const reviewData = reviewSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, "id">),
      }));

      setReviews(reviewData);

      if (initialProduct.images?.length) {
        setSelectedImage(initialProduct.images[0]);
      } else {
        setSelectedImage(initialProduct.image || "");
      }

      if (
        initialProduct.variants?.length &&
        initialProduct.variants[0]?.values?.length
      ) {
        setSelectedVariant(
          initialProduct.variants[0].values[0]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  fetchReviews();
}, [initialProduct]);

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-10">
        Produk tidak ditemukan
      </div>
    );
  }

  const finalPrice =
  selectedVariant?.price ??
  getEffectivePrice(product);

  const handleAddToCart = (
  showAlert = true
) => {
  if (!product) return;

  const cartItem = {
    id: String(product.id),

    name:
      product.name +
      (selectedVariant
  ? ` - ${selectedVariant.value}`
  : ""),

    price: Number(finalPrice),

    image:
  product.images?.[0] ||
  product.image ||
  "",

    quantity: Number(quantity),

    weight: Number(product.weight || 0),

    length: Number(product.length || 0),

    width: Number(product.width || 0),

    height: Number(product.height || 0),
  };

  console.log("ADD TO CART:", cartItem);

  addToCart(cartItem);

  if (showAlert) {
    alert("Produk ditambahkan");
  }
};

  const handleBuyNow = () => {
  handleAddToCart(false);

  router.push("/checkout");
};

const handleWhatsApp = () => {
  const productName =
    product.name;

  const variant =
    selectedVariant?.value
      ? `\nVarian: ${selectedVariant.value}`
      : "";

  const qty =
    `\nJumlah: ${quantity}`;

  const message =
    `Halo admin, saya ingin bertanya mengenai produk:\n\n${productName}${variant}${qty}`;

  const url =
    `https://wa.me/6285710255464?text=${encodeURIComponent(
      message
    )}`;

  window.open(
    url,
    "_blank"
  );
};

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* IMAGE */}

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <div className="relative w-full aspect-square overflow-hidden rounded-2xl">

            {selectedImage ? (
  <Image
  src={
    selectedImage ||
    "/placeholder.png"
  }
    alt={product.name}
    fill
  sizes="(max-width:768px)100vw,50vw"
    className="object-cover"
  />
) : (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
    No Image
  </div>
)}

          </div>

{/* THUMBNAILS */}

{product.images &&
product.images.filter(Boolean).length > 0 && (

  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">

    {product.images
      .filter(
        (img): img is string => Boolean(img)
      )
      .map((img, index) => (

        <button
          key={index}
          onClick={() =>
            setSelectedImage(img)
          }
          className={`
            relative
            w-20
            h-20
            rounded-xl
            overflow-hidden
            border-2
            flex-shrink-0
            ${
              selectedImage === img
                ? "border-black"
                : "border-gray-200"
            }
          `}
        >

          <Image
            src={img}
            alt={`thumb-${index}`}
            fill
  sizes="80px"
            className="object-cover"
          />

        </button>
      ))}

  </div>
)}

        </div>

        {/* INFO */}

  <div className="bg-white rounded-3xl p-8 shadow-sm">
  <div className="mb-6">

  <div className="flex items-center gap-2 mb-2">

    <div className="flex">
      {[1,2,3,4,5].map((star) => (
  <Star
    key={star}
    size={16}
    className={
      star <= Math.round(product.rating || 0)
        ? "fill-yellow-400 text-yellow-400"
        : "text-gray-300"
    }
  />
))}
    </div>

    <span className="text-sm text-gray-600">
  {product.rating
  ? `${product.rating.toFixed(1)} (${product.reviewCount || 0} ulasan)`
  : "Belum ada ulasan"}
</span>

  </div>

  {product.category && (
  <div className="mb-2">
    <Link
      href={`/kategori/${encodeURIComponent(product.category)}`}
      className="text-sm text-blue-600 hover:underline"
    >
      {product.category}
    </Link>
  </div>
)}

  <h1 className="text-3xl font-bold">
    {product.name}
  </h1>

</div>

          <p className="text-3xl font-semibold text-green-700 mb-8">

            Rp
            {finalPrice.toLocaleString()}

          </p>

          {/* VARIANT */}

          {product.variants &&
            product.variants.length > 0 && (
              <div className="mb-8">

                <h2 className="font-semibold mb-3">
                  Pilih Varian
                </h2>

                <div className="flex flex-wrap gap-3">

                  {product.variants.map(
  (variant, variantIndex) => (
    <div
      key={variantIndex}
      className="mb-5"
    >

      <p className="font-medium mb-3">
        {variant.name}
      </p>

      <div className="flex flex-wrap gap-3">

        {variant.values.map(
          (valueItem, valueIndex) => (
            <button
              key={valueIndex}
              onClick={() =>
                setSelectedVariant(
                  valueItem
                )
              }
              className={`px-5 py-3 rounded-xl border transition ${
                selectedVariant?.value ===
                valueItem.value
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-300"
              }`}
            >

              {valueItem.value}

            </button>
          )
        )}

      </div>

    </div>
  )
)}

                </div>

              </div>
            )}

          {/* QUANTITY */}

          <div className="mb-8">

            <h2 className="font-semibold mb-3">
              Jumlah
            </h2>

            <div className="flex items-center gap-4">

              <button
                onClick={() =>
                  setQuantity((prev) =>
                    Math.max(1, prev - 1)
                  )
                }
                className="w-10 h-10 rounded-full border"
              >
                -
              </button>

              <span className="text-xl font-semibold">
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity((prev) =>
                    prev + 1
                  )
                }
                className="w-10 h-10 rounded-full border"
              >
                +
              </button>

            </div>

          </div>

          {/* BUTTON */}

          <div className="grid md:grid-cols-2 gap-4">

            <button
              onClick={() => handleAddToCart()}
              className="bg-white border border-black py-4 rounded-2xl font-semibold hover:bg-black hover:text-white transition"
            >
              Tambah ke Keranjang
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-green-600 text-white py-4 rounded-2xl font-semibold hover:opacity-90"
            >
              Checkout Langsung
            </button>

            <button
  onClick={handleWhatsApp}
  className="bg-green-500 text-white py-4 rounded-2xl font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
>

  <MessageCircle size={22} />

  Chat Admin

</button>

          </div>

          {/* DESCRIPTION */}

          <div className="mb-10">

            <h2 className="text-xl font-semibold mb-3">
              Deskripsi Produk
            </h2>

            <p className="text-gray-600 leading-8 whitespace-pre-line">
              {product.description}
            </p>

          </div>

          <div className="mt-12">

  <h2 className="text-xl font-semibold mb-6">

    Ulasan Pembeli

  </h2>

  {reviews.length === 0 ? (

    <p className="text-gray-500">

      Belum ada ulasan

    </p>

  ) : (

    <div className="space-y-4">

      {reviews.map((review) => (

        <div
          key={review.id}
          className="border rounded-2xl p-4"
        >

          <div className="flex items-center gap-2 mb-2">

            {[1,2,3,4,5].map((star) => (
  <Star
    key={star}
    size={16}
    className={
      star <= review.rating
        ? "fill-yellow-400 text-yellow-400"
        : "text-gray-300"
    }
  />
))}

          </div>

          <p className="font-medium">

            {review.customerName}

          </p>

          <p className="text-gray-600 mt-2">

            {review.review}

          </p>

        </div>

      ))}

    </div>

  )}

</div>


        </div>

        </div>

    </main>
  );
}