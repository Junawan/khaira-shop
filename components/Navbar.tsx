"use client";

import Link from "next/link";

import { useCartStore } from "@/store/cart";

import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  ShoppingCart,
  MessageCircle,
  Package
} from "lucide-react";

export default function Navbar() {
  const cart = useCartStore(
    (state) => state.cart
  );

  const totalItems = cart.reduce(
    (acc, item) =>
      acc + item.quantity,
    0
  );

  const [user, setUser] =
  useState<User | null>(null);

useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          const customerDoc =
            await getDoc(
              doc(
                db,
                "customers",
                firebaseUser.uid
              )
            );

          if (
            customerDoc.exists()
          ) {
            setCustomerName(
              customerDoc.data()
                .name || ""
            );
          }
        } else {
          setCustomerName("");
        }
      }
    );

  return () => unsubscribe();
}, []);

const handleLogout = async () => {
  await signOut(auth);
};

const [customerName, setCustomerName] =
  useState("");

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

  <Link
    href="/login"
    className="px-4 py-2 rounded-xl border"
  >
    Masuk
  </Link>

  <Link
    href="/register"
    className="px-4 py-2 rounded-xl bg-black text-white"
  >
    Daftar
  </Link>

  {user ? (
  <>
    <span className="hidden md:block font-medium">
      Halo, {customerName}
    </span>

    <Link
      href="/account"
      className="px-4 py-2 rounded-xl border"
    >
      Akun Saya
    </Link>

    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-xl bg-red-500 text-white"
    >
      Logout
    </button>
  </>
) : (
  <>
    <Link
      href="/login"
      className="px-4 py-2 rounded-xl border"
    >
      Masuk
    </Link>

    <Link
      href="/register"
      className="px-4 py-2 rounded-xl bg-black text-white"
    >
      Daftar
    </Link>
  </>
)}

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

        <Link
  href="/account/orders"
  className="relative"
>
  <div className="bg-white border p-3 rounded-2xl hover:bg-gray-50 transition shadow-sm">
    <Package size={24} />
  </div>
</Link>

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