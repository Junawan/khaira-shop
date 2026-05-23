"use client";

import { useState } from "react";

import { useCartStore } from "@/store/cart";

import QRCode from "qrcode";

export default function CheckoutPage() {
  const cart = useCartStore(
    (state) => state.cart
  );

  const clearCart = useCartStore(
    (state) => state.clearCart
  );

  const subtotal = cart.reduce(
    (acc, item) =>
      acc +
      item.price * item.quantity,
    0
  );

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

  const [qrImage, setQrImage] =
    useState("");

  const [paymentData, setPaymentData] =
    useState<any>(null);

  const shippingCost =
    selectedShipping?.price || 0;

  const totalPrice =
    subtotal + shippingCost;

  // =========================
  // CHECK SHIPPING
  // =========================

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

            quantity:
              item.quantity,

            weight:
              (item.weight ||
                1000) *
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

        console.log(
          "ONGKIR RESPONSE:",
          data
        );

        if (data.pricing) {
          setShippingOptions(
            data.pricing
          );
        } else {
          alert(
            data.message ||
              "Gagal mengambil ongkir"
          );
        }
      } catch (error) {
        console.log(error);

        alert(
          "Terjadi kesalahan saat cek ongkir"
        );
      } finally {
        setLoadingShipping(
          false
        );
      }
    };

  // =========================
  // CHECKOUT
  // =========================

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

                total:
                  totalPrice,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "PAYMENT RESPONSE:",
          data
        );

        // =========================
        // ERROR
        // =========================

        if (!data.success) {
          alert(
            data.message ||
              "Gagal membuat pembayaran"
          );

          return;
        }

        // =========================
        // AMBIL QR STRING
        // =========================

        const qrString =
  data?.qrString;

        if (!qrString) {
          alert(
            "QRIS tidak ditemukan"
          );

          return;
        }

        // =========================
        // GENERATE QR IMAGE
        // =========================

        const qr =
          await QRCode.toDataURL(
            qrString
          );

        setQrImage(qr);

        setPaymentData({
  total_payment: totalPrice,
});

        // =========================
        // CLEAR CART
        // =========================

        clearCart();

      } catch (error) {
        console.log(
          "CHECKOUT ERROR:",
          error
        );

        alert("Checkout gagal");
      } finally {
        setLoadingCheckout(
          false
        );
      }
    };

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* FORM */}

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <h1 className="text-3xl font-bold mb-8">
            Checkout
          </h1>

          <div className="space-y-5">

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

            {/* BUTTON CEK ONGKIR */}

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

            {/* SHIPPING OPTIONS */}

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

            {/* BUTTON CHECKOUT */}

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
                : "Bayar dengan QRIS"}
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

          {/* QR PAYMENT */}

          {qrImage && (
            <div className="mt-8 border-t pt-8 text-center">

              <h3 className="text-xl font-bold mb-4">
                Scan QRIS untuk Pembayaran
              </h3>

              <img
                src={qrImage}
                alt="QRIS"
                className="w-72 h-72 mx-auto"
              />

              <p className="mt-4 text-lg font-semibold">
                Total Bayar
              </p>

              <p className="text-3xl font-bold text-green-600">
                Rp
                {paymentData?.total_payment?.toLocaleString()}
              </p>

              <p className="mt-4 text-sm text-gray-500">
                Berlaku sampai:
              </p>

              <p className="font-semibold">
                {
                  paymentData?.expired_at
                }
              </p>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}