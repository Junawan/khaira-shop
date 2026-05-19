"use client";

import { useCartStore } from "@/store/cart";

export default function Navbar() {
  const cart = useCartStore((state) => state.cart);

  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">

      {/* LOGO + TEXT */}
      <div className="flex items-center gap-3">

        <img
          src="/logo.png"
          alt="KhairaShop25"
          className="w-12 h-12 object-contain"
        />

        <h1 className="text-2xl font-bold text-gray-800">
          KhairaShop25
        </h1>

      </div>

      {/* CART */}
      <div className="relative">

        <a href="/cart">

          <button className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition">
            Keranjang ({totalItems})
          </button>

        </a>

      </div>

    </nav>
  );
}