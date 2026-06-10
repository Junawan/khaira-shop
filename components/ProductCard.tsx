"use client";

import { useCartStore } from "@/store/cart";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  useEffect,
  useState
} from "react";

import { Star } from "lucide-react";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;

  images?: string[];

  image?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  images,
  image,
}: ProductCardProps) {
  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const mainImage =
  images && images.length > 0
    ? images[0]
    : image || "";

    useEffect(() => {

  const loadReviews = async () => {

    try {

      const q = query(
        collection(db, "reviews"),
        where("productId", "==", id)
      );

      const snapshot =
        await getDocs(q);

      const reviews =
        snapshot.docs.map(
          (doc) => doc.data()
        );

      if (reviews.length > 0) {

        const total =
          reviews.reduce(
            (sum: number, item: any) =>
              sum + Number(item.rating || 0),
            0
          );

        setAvgRating(
          total / reviews.length
        );

        setReviewCount(
          reviews.length
        );

      }

    } catch (error) {

      console.log(error);

    }

  };

  loadReviews();

}, [id]);

    const [avgRating, setAvgRating] =
  useState(0);

const [reviewCount, setReviewCount] =
  useState(0);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">

      {/* IMAGE */}
      {mainImage ? (
  <img
    src={mainImage}
    alt={name}
    className="w-full aspect-square object-cover"
  />
) : (
  <div className="w-full aspect-square bg-gray-200"></div>
)}

      {/* CONTENT */}
      <div className="p-3">

        <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-2 leading-5 min-h-[40px]">
          {name}
        </h3>

        <p className="mt-2 text-base font-bold text-black">
          Rp{price.toLocaleString()}
        </p>

<div className="flex items-center gap-1 mt-2">

  <Star
    size={14}
    className="fill-yellow-400 text-yellow-400"
  />

  <span className="text-xs text-gray-600">

    {reviewCount > 0
      ? `${avgRating.toFixed(1)} (${reviewCount})`
      : "Belum ada ulasan"}

  </span>

</div>

      </div>
    </div>
  );
}