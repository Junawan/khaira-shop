"use client";

import { useState } from "react";

import Script from "next/script";

import { useCartStore } from "@/store/cart";


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

  const handleCheckout = async () => {
  if (
    !name ||
    !email ||
    !phone ||
    !address ||
    !postalCode
  ) {
    alert("Lengkapi data checkout");
    return;
  }

  if (!selectedShipping) {
    alert("Pilih pengiriman");
    return;
  }

  try {
    setLoadingCheckout(true);

    const response = await fetch(
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
          total: totalPrice,
        }),
      }
    );

    const data = await response.json();

    console.log("TRIPAY RESPONSE:", data);

    // ERROR
    if (!data.success) {
      alert(
        data.message ||
          "Gagal membuat pembayaran"
      );

      return;
    }

    // REDIRECT KE HALAMAN BAYAR
    window.location.href =
      data.paymentUrl;

  } catch (error) {
    console.log(error);

    alert("Checkout gagal");
  } finally {
    setLoadingCheckout(false);
  }
};

  return (
    <>
      {/* MIDTRANS SNAP */}

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
      </main>
    </>
  );
}