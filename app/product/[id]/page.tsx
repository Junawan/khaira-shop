"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useCartStore } from "@/store/cart";

type Variant = {
  name: string;

  value: string;

  price: number;

  stock?: number;
};

type Product = {
  id?: string;

  name: string;

  description?: string;

  image?: string;

  price: number;

  variants?: Variant[];

  weight?: number;

  length?: number;

  width?: number;

  height?: number;
};

export default function ProductDetailPage() {
  const params = useParams();

  const router = useRouter();

  const addToCart =
    useCartStore(
      (state) => state.addToCart
    );

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedVariant,
    setSelectedVariant,
  ] = useState<Variant | null>(null);

  const [quantity, setQuantity] =
    useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(
          db,
          "products",
          params.id as string
        );

        const docSnap =
          await getDoc(docRef);

        if (docSnap.exists()) {
          const data =
            docSnap.data();

          const productData: Product = {
            id: docSnap.id,

            name: data.name || "",

            description:
              data.description || "",

            image: data.image || "",

            price: data.price || 0,

            variants:
              data.variants || [],

            weight:
              data.weight || 0,

            length:
              data.length || 0,

            width:
              data.width || 0,

            height:
              data.height || 0,
          };

          setProduct(productData);

          if (
            productData.variants &&
            productData.variants.length > 0
          ) {
            setSelectedVariant(
              productData.variants[0]
            );
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

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
    selectedVariant?.price ||
    product.price;

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

    image: product.image || "",

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

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* IMAGE */}

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <div className="relative w-full aspect-square overflow-hidden rounded-2xl">

            {product.image ? (
              <Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                No Image
              </div>
            )}

          </div>

        </div>

        {/* INFO */}

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <h1 className="text-4xl font-bold mb-4">
            {product.name}
          </h1>

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
  (variant, index) => (
    <button
      key={index}
      onClick={() =>
        setSelectedVariant(
          variant
        )
      }
      className={`px-5 py-3 rounded-xl border transition ${
        selectedVariant?.value ===
        variant.value
          ? "bg-black text-white border-black"
          : "bg-white border-gray-300"
      }`}
    >
      {variant.value}
    </button>
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

          {/* DESCRIPTION */}

          <div className="mb-10">

            <h2 className="text-xl font-semibold mb-3">
              Deskripsi Produk
            </h2>

            <p className="text-gray-600 leading-8 whitespace-pre-line">
              {product.description}
            </p>

          </div>

          {/* BUTTON */}

          <div className="grid grid-cols-2 gap-4">

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

          </div>

        </div>

      </div>

    </main>
  );
}