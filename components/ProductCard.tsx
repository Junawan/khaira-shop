"use client";

import { useCartStore } from "@/store/cart";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
}: ProductCardProps) {
  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200"></div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {name}
        </h3>

        <p className="mt-2 text-gray-600">
          Rp{price.toLocaleString()}
        </p>

      </div>
    </div>
  );
}