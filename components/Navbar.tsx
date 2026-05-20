"use client";

import Link from "next/link";

import {
  ShoppingCart,
  MessageCircle,
} from "lucide-react";

import { useCartStore } from "@/store/cart";

export default function Navbar() {
  const cart = useCartStore(
    (state) => state.cart
  );

  const totalItems = cart.reduce(
    (acc, item) =>
      acc + item.quantity,
    0
  );

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">

      {/* LOGO */}
      <Link
        href="/"
        className="flex items-center gap-3"
      >
        <img
          src="/logo.png"
          alt="KhairaShop25"
          className="w-12 h-12 object-contain"
        />

        <h1 className="text-2xl font-bold text-gray-800">
          KhairaShop25
        </h1>
      </Link>

      {/* RIGHT MENU */}
      <div className="flex items-center gap-3">

        {/* WHATSAPP */}
        <a
          href="https://wa.me/6285710255464"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white p-3 rounded-2xl hover:bg-green-600 transition shadow-sm"
        >
          <MessageCircle
            size={24}
          />
        </a>

        {/* CART */}
        <Link
          href="/cart"
          className="relative"
        >
          <div className="relative bg-black text-white p-3 rounded-2xl hover:bg-gray-800 transition shadow-sm">

            <ShoppingCart
              size={24}
            />

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full font-bold shadow">
                {totalItems}
              </span>
            )}
          </div>
        </Link>

      </div>

    </nav>
  );
}