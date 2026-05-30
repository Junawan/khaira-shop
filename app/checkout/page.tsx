"use client";

//app checkout

import { useState } from "react";

import Script from "next/script";

import { useCartStore } from "@/store/cart";

import { useEffect } from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import Link from "next/link";

import {
  collection,
  getDocs,
} from "firebase/firestore";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const cart = useCartStore(
    (state) => state.cart
  );

  const [checkingProfile, setCheckingProfile] =
  useState(true);

const [profileComplete, setProfileComplete] =
  useState(false);

const [isLoggedIn, setIsLoggedIn] =
  useState(false);

  const clearCart = useCartStore(
    (state) => state.clearCart
  );

  const [addresses, setAddresses] =
  useState<any[]>([]);

const [showAddresses, setShowAddresses] =
  useState(false);

  const subtotal = cart.reduce(
    (acc, item) =>
      acc +
      item.price * item.quantity,
    0
  );

  useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setIsLoggedIn(false);
          setCheckingProfile(false);
          return;
        }

        setIsLoggedIn(true);

        const snap =
          await getDoc(
            doc(
              db,
              "customers",
              user.uid
            )
          );

        if (!snap.exists()) {
          setCheckingProfile(false);
          return;
        }

        const data = snap.data();

setName(data.name || "");
setEmail(data.email || user.email || "");
setPhone(data.phone || "");
setAddress(data.address || "");
setPostalCode(data.postalCode || "");

const addressSnap =
  await getDocs(
    collection(
      db,
      "customers",
      user.uid,
      "addresses"
    )
  );

const list = addressSnap.docs.map(
  (doc) => ({
    id: doc.id,
    ...doc.data(),
  })
);

setAddresses(list);

const complete =
  !!data.name &&
  !!data.phone &&
  !!data.address &&
  !!data.postalCode;

setProfileComplete(
  complete
);

        setCheckingProfile(false);
      }
    );

  return () => unsubscribe();
}, []);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [postalCode, setPostalCode] =
    useState("");

  const [note, setNote] =
    useState("");

  const [loadingCheckout, setLoadingCheckout] =
    useState(false);

  const [loadingShipping, setLoadingShipping] =
    useState(false);

  const [shippingOptions, setShippingOptions] =
    useState<any[]>([]);

  const [selectedShipping, setSelectedShipping] =
    useState<any>(null);

    const [paymentMethod, setPaymentMethod] =
  useState("midtrans");

  const [paymentProof, setPaymentProof] =
  useState<File | null>(null);

  const shippingCost =
    selectedShipping?.price || 0;

  const totalPrice =
    subtotal + shippingCost;

  const handleCheckShipping =
    async () => {
      if (!postalCode) {
        alert("Masukkan kode pos");
        return;
      }

      try {
        setLoadingShipping(true);

        const items = cart.map(
          (item) => ({
            name: item.name,
            value: item.price,
            quantity: item.quantity,
            weight:
              (item.weight || 1000) *
              item.quantity,
            length:
              item.length || 10,
            width:
              item.width || 10,
            height:
              item.height || 10,
          })
        );

        const response =
          await fetch(
            "/api/check-rates",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                destination_postal_code:
                  postalCode,
                items,
              }),
            }
          );

        const data =
          await response.json();

        if (data.pricing) {
          setShippingOptions(
            data.pricing
          );
        } else {
          alert(
            "Gagal mengambil ongkir"
          );
        }
      } catch (error) {
        console.log(error);

        alert(
          "Terjadi kesalahan"
        );
      } finally {
        setLoadingShipping(
          false
        );
      }
    };

  const handleCheckout =
    async () => {
      if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !postalCode
      ) {
        alert(
          "Lengkapi data checkout"
        );
        return;
      }

      if (!selectedShipping) {
  alert(
    "Pilih pengiriman"
  );
  return;
}

if (
  paymentMethod === "bca_qris" &&
  !paymentProof
) {
  alert(
    "Upload bukti pembayaran terlebih dahulu"
  );
  return;
}

if (
  paymentMethod === "midtrans" &&
  !window.snap
) {
  alert("Midtrans belum siap");
  return;
}

      try {
        setLoadingCheckout(true);

        const response =
          await fetch(
            "/api/create-transaction",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
  uid: auth.currentUser?.uid,

  paymentMethod,

  name,
  email,
  phone,
  address,
  postalCode,
  note,

  items: cart,

  shippingCost:
    selectedShipping.price,

  courier:
    selectedShipping.courier_name,

  courierService:
    selectedShipping.courier_service_name,

  total: totalPrice,
}),
            }
          );

        const data =
          await response.json();

          if (
  paymentMethod === "bca_qris"
) {

  const formData =
    new FormData();

  formData.append(
    "file",
    paymentProof!
  );

  formData.append(
    "orderId",
    data.orderId
  );

  await fetch(
    "/api/upload-payment-proof",
    {
      method: "POST",
      body: formData,
    }
  );

  clearCart();

  alert(
    "Pesanan berhasil dibuat dan menunggu verifikasi pembayaran."
  );

  window.location.href =
    `/payment-success?order_id=${data.orderId}`;

  return;
}

        console.log(data);

        if (!data.token) {
          alert(
            data.error ||
              "Gagal membuat pembayaran"
          );

          return;
        }

        if (
  paymentMethod === "midtrans"
) {
  window.snap.pay(
    data.token,
    {
            onSuccess:
              function () {
                clearCart();

                alert(
                  "Pembayaran berhasil"
                );

                window.location.href =
  `/payment-success?order_id=${data.orderId}`;
              },

            onPending:
              function () {
                alert(
                  "Menunggu pembayaran"
                );
              },

            onError:
              function (error: any) {
                console.log(error);

                alert(
                  "Pembayaran gagal"
                );
              },

            onClose:
              function () {
                console.log(
                  "Popup ditutup"
                );
              },
          }
        );
      }
    
} catch (error) {
        console.log(error);

        alert(
          "Checkout gagal"
        );
      } finally {
        setLoadingCheckout(false);
      }
    };

    if (checkingProfile) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

if (!isLoggedIn) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">

      <div className="bg-white p-8 rounded-3xl shadow text-center">

        <h2 className="text-2xl font-bold mb-4">
          Login Diperlukan
        </h2>

        <p className="text-gray-600 mb-6">
          Silakan login terlebih dahulu untuk melanjutkan checkout.
        </p>

        <Link
          href="/login"
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Login
        </Link>

      </div>

    </div>
  );
}

if (!profileComplete) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">

      <div className="bg-white p-8 rounded-3xl shadow max-w-md text-center">

        <h2 className="text-2xl font-bold mb-4">
          Lengkapi Profil Anda
        </h2>

        <p className="text-gray-600 mb-6">
          Untuk melakukan checkout, silakan lengkapi data akun terlebih dahulu.
        </p>

        <Link
          href="/account"
          className="bg-black text-white px-6 py-3 rounded-xl inline-block"
        >
          Ke Halaman Akun
        </Link>

      </div>

    </div>
  );
}

  return (
    <>
      {/* MIDTRANS SNAP */}

      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={
          process.env
            .NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
        }
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#faf7f2] p-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

          {/* FORM */}

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <h1 className="text-3xl font-bold mb-8">
              Checkout
            </h1>

            <div className="flex justify-between items-center">

  <label className="font-semibold">
    Alamat Pengiriman
  </label>

  <button
    type="button"
    onClick={() =>
      setShowAddresses(true)
    }
    className="text-blue-600 text-sm"
  >
    Gunakan Alamat Lain
  </button>

</div>

            <div className="space-y-5">

              <div className="bg-gray-50 border rounded-2xl p-4 mb-5">

  <div className="flex justify-between items-start">

    <div>

      <p className="font-semibold">
        {name || "-"}
      </p>

      <p className="text-sm text-gray-500">
        {phone || "-"}
      </p>

      <p className="text-sm mt-2 text-gray-700">
        {address || "-"}
      </p>

      <p className="text-sm text-gray-500">
        Kode Pos: {postalCode || "-"}
      </p>

    </div>

    {addresses.length > 0 && (
      <button
        type="button"
        onClick={() =>
          setShowAddresses(true)
        }
        className="text-blue-600 text-sm"
      >
        Ubah
      </button>
    )}

  </div>

</div>

              <input
                type="text"
                placeholder="Nama lengkap"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="text"
                placeholder="Nomor WhatsApp"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <textarea
                placeholder="Alamat lengkap"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 h-32"
              />

              <input
                type="text"
                placeholder="Kode Pos"
                value={postalCode}
                onChange={(e) =>
                  setPostalCode(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <textarea
                placeholder="Catatan pesanan"
                value={note}
                onChange={(e) =>
                  setNote(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 h-24"
              />

              <button
                onClick={
                  handleCheckShipping
                }
                className="w-full bg-black text-white py-4 rounded-2xl"
              >
                {loadingShipping
                  ? "Loading..."
                  : "Cek Ongkir"}
              </button>

              <div className="space-y-3">

                {shippingOptions.map(
                  (
                    option,
                    index
                  ) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setSelectedShipping(
                          option
                        )
                      }
                      className={`w-full border rounded-2xl p-4 text-left ${
                        selectedShipping?.courier_name ===
                          option.courier_name &&
                        selectedShipping?.courier_service_name ===
                          option.courier_service_name
                          ? "border-green-600 bg-green-50"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between">

                        <div>
                          <p className="font-semibold">
                            {
                              option.courier_name
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            {
                              option.courier_service_name
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            Estimasi{" "}
                            {
                              option.duration
                            }
                          </p>
                        </div>

                        <p className="font-bold">
                          Rp
                          {option.price.toLocaleString()}
                        </p>

                      </div>
                    </button>
                  )
                )}
              </div>
              

              <button
                onClick={
                  handleCheckout
                }
                disabled={
                  loadingCheckout
                }
                className="w-full bg-green-600 text-white py-4 rounded-xl disabled:opacity-50"
              >
                {loadingCheckout
                  ? "Memproses..."
                  : "Lanjut Pembayaran"}
              </button>

            </div>
          </div>

          {/* SUMMARY */}

          <div className="bg-white rounded-3xl p-8 shadow-sm h-fit">

            <h2 className="text-2xl font-bold mb-6">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-4">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >

                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.quantity}x
                    </p>
                  </div>

                  <p>
                    Rp
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString()}
                  </p>

                </div>
              ))}

            </div>

            <div className="border-t mt-6 pt-6 space-y-3">

              <div className="flex justify-between">
                <span>Subtotal</span>

                <span>
                  Rp
                  {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Ongkir</span>

                <span>
                  Rp
                  {shippingCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-2xl font-bold pt-4 border-t">

                <span>Total</span>

                <span>
                  Rp
                  {totalPrice.toLocaleString()}
                </span>

              </div>

            </div>

          </div>
        </div>
        {showAddresses && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

    <div className="bg-white rounded-3xl w-full max-w-xl shadow-xl">

      <div className="p-6 border-b">

        <h2 className="text-2xl font-bold">
          Pilih Alamat Pengiriman
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Pilih salah satu alamat yang tersimpan
        </p>

      </div>

      <div className="p-6 max-h-[450px] overflow-y-auto space-y-3">

        {addresses.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Belum ada alamat tersimpan
          </div>
        ) : (
          addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => {

                setName(
                  addr.receiverName || ""
                );

                setPhone(
                  addr.phone || ""
                );

                setAddress(
                  addr.address || ""
                );

                setPostalCode(
                  addr.postalCode || ""
                );

                setShippingOptions([]);
                setSelectedShipping(null);

                setShowAddresses(false);

              }}
              className="
                w-full
                text-left
                border
                rounded-2xl
                p-4
                hover:border-black
                hover:bg-gray-50
                transition
              "
            >

              <p className="font-semibold">
                {addr.label}
              </p>

              <p className="text-sm mt-1">
                {addr.receiverName}
              </p>

              <p className="text-sm text-gray-500">
                {addr.phone}
              </p>

              <p className="text-sm text-gray-600 mt-2">
                {addr.address}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Kode Pos: {addr.postalCode}
              </p>

            </button>
          ))
        )}

      </div>

      <div className="p-6 border-t">

        <button
          type="button"
          onClick={() =>
            setShowAddresses(false)
          }
          className="
            w-full
            py-3
            rounded-xl
            border
            font-medium
          "
        >
          Tutup
        </button>

      </div>

    </div>

  </div>
)}
      </main>
    </>
  );
}