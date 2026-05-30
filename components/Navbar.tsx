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

import {
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const cart = useCartStore(
    (state) => state.cart
  );

  const [mobileMenuOpen, setMobileMenuOpen] =
  useState(false);

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
  className="
    w-10 h-10
    md:w-12 md:h-12
    object-contain
  "
/>

        <h1 className="
  text-lg
  md:text-2xl
  font-bold
  text-gray-800
">
          KhairaShop25
        </h1>
      </Link>

      {/* MOBILE MENU */}
<div className="flex md:hidden items-center gap-2">

  {/* CART */}
  <Link
    href="/cart"
    className="relative"
  >
    <div className="relative bg-black text-white p-3 rounded-2xl">

      <ShoppingCart size={22} />

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full font-bold">
          {totalItems}
        </span>
      )}

    </div>
  </Link>

  {/* HAMBURGER */}
  <button
    onClick={() =>
      setMobileMenuOpen(
        !mobileMenuOpen
      )
    }
    className="
      border
      p-3
      rounded-2xl
      bg-white
    "
  >
    {mobileMenuOpen ? (
      <X size={22} />
    ) : (
      <Menu size={22} />
    )}
  </button>

</div>

      {/* RIGHT MENU */}
      <div className="hidden md:flex items-center gap-3">

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

        <button
  onClick={() =>
    setMobileMenuOpen(
      !mobileMenuOpen
    )
  }
  className="
    md:hidden
    bg-white
    border
    p-3
    rounded-2xl
  "
>
  {mobileMenuOpen ? (
    <X size={22} />
  ) : (
    <Menu size={22} />
  )}
</button>

      </div>

{mobileMenuOpen && (

  <>

    {/* Overlay */}

    <div
      onClick={() =>
        setMobileMenuOpen(false)
      }
      className="
        fixed inset-0
        bg-black/40
        z-40
      "
    />

    {/* Drawer */}

    <div
      className="
        fixed
        top-0
        right-0
        h-full
        w-72
        bg-white
        shadow-xl
        z-50
        p-6
      "
    >

      <div className="mb-6">

        {user ? (

          <>
            <p className="text-gray-500">
              Halo
            </p>

            <p className="font-bold">
              {customerName}
            </p>
          </>

        ) : (

          <p className="font-bold">
            Menu
          </p>

        )}

      </div>

      <div className="flex flex-col gap-3">

        {user ? (

          <>

            <Link
              href="/account"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
              className="
                border
                rounded-xl
                px-4 py-3
              "
            >
              Akun Saya
            </Link>

            <Link
              href="/account/orders"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
              className="
                border
                rounded-xl
                px-4 py-3
              "
            >
              Pesanan Saya
            </Link>

            <button
              onClick={
                handleLogout
              }
              className="
                bg-red-500
                text-white
                rounded-xl
                px-4 py-3
              "
            >
              Logout
            </button>

          </>

        ) : (

          <>

            <Link
              href="/login"
              className="
                border
                rounded-xl
                px-4 py-3
              "
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="
                bg-black
                text-white
                rounded-xl
                px-4 py-3
              "
            >
              Daftar
            </Link>

          </>

        )}

        <a
          href="https://wa.me/6285710255464"
          target="_blank"
          className="
            bg-green-500
            text-white
            rounded-xl
            px-4 py-3
            text-center
          "
        >
          WhatsApp
        </a>

      </div>

    </div>

  </>

)}
    </nav>
  );
}