"use client";

import Image from "next/image";

type ProductCardProps = {
  name: string;
  price: number;

  images?: string[];

  image?: string;
};

export default function ProductCard({
  name,
  price,
  images,
  image,
}: ProductCardProps) {
  const mainImage =
  images && images.length > 0
    ? images[0]
    : image || "";

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">

      {/* IMAGE */}
      {mainImage ? (
        <div className="relative w-full aspect-square">
          <Image
            src={mainImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        </div>
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

      </div>
    </div>
  );
}
