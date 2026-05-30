"use client";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  db
} from "@/lib/firebase";

import {
  useParams
} from "next/navigation";

import Script from "next/script";

declare global {
  interface Window {
    snap: any;
  }
}

export default function OrderDetailPage() {

  const params = useParams();

  const [order, setOrder] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

    const [loadingPay, setLoadingPay] =
  useState(false);

const handlePayAgain =
  async () => {

    try {

      setLoadingPay(true);

      const response =
        await fetch(
          "/api/pay-order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              orderId:
                order.orderId,
            }),
          }
        );

      const data =
        await response.json();

      if (!data.token) {

        alert(
          data.message ||
          "Gagal membuat pembayaran"
        );

        return;
      }

      if (!window.snap) {
  alert("Midtrans belum siap");
  return;
}

      window.snap.pay(
        data.token
      );

    } catch (error) {

      console.log(error);

      alert(
        "Gagal membuat pembayaran"
      );

    } finally {

      setLoadingPay(false);

    }
};

  useEffect(() => {

    const loadOrder = async () => {

      try {

        const snap =
          await getDoc(
            doc(
              db,
              "orders",
              params.id as string
            )
          );

        if (snap.exists()) {

          setOrder({
            id: snap.id,
            ...snap.data(),
          });

        }

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

    loadOrder();

  }, [params.id]);

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10">
        Order tidak ditemukan
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-5xl mx-auto space-y-6">

      <Script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={
    process.env
      .NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  }
  strategy="afterInteractive"
/>

        {/* HEADER */}

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <h1 className="text-3xl font-bold">

            {order.orderId}

          </h1>

          <div className="flex gap-2 mt-4 flex-wrap">

            <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm">

              {order.paymentStatus}

            </span>

            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm">

              {order.orderStatus}

            </span>

          </div>

        </div>

        {/* ALAMAT */}

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-4">

            Alamat Pengiriman

          </h2>

          <p className="font-semibold">
            {order.customerName}
          </p>

          <p className="text-gray-500">
            {order.phone}
          </p>

          <p className="mt-3">
            {order.address}
          </p>

          <p className="text-gray-500">
            Kode Pos:
            {" "}
            {order.postalCode}
          </p>

        </div>

        {/* PRODUK */}

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-4">

            Produk

          </h2>

          <div className="space-y-4">

            {order.items?.map(
              (
                item: any,
                index: number
              ) => (

                <div
                  key={index}
                  className="flex justify-between border-b pb-4"
                >

                  <div>

                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty:
                      {" "}
                      {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold">

                    Rp
                    {(item.price * item.quantity)
                      .toLocaleString()}

                  </p>

                </div>

              )
            )}

          </div>

        </div>

        {/* PENGIRIMAN */}

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-4">

            Pengiriman

          </h2>

          <div className="space-y-2">

            <p>

              Kurir:
              {" "}
              {order.courier}

            </p>

            <p>

              Layanan:
              {" "}
              {order.courierService}

            </p>

            <p>

              Resi:
              {" "}

              {order.airwayBillId || "-"}

            </p>

          </div>

        </div>

        {
  (
    order.paymentStatus === "pending" ||
    order.paymentStatus === "expire"
  ) && (

    <button
      onClick={
        handlePayAgain
      }
      disabled={
        loadingPay
      }
      className="
        w-full
        mt-6
        bg-green-600
        text-white
        py-4
        rounded-2xl
      "
    >
      {
        loadingPay
          ? "Memproses..."
          : "Lanjutkan Pembayaran"
      }
    </button>
)
}

        {/* TRACKING */}

        {order.trackingLink && (

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <h2 className="text-xl font-bold mb-4">

              Tracking

            </h2>

            <a
              href={order.trackingLink}
              target="_blank"
              className="text-blue-600"
            >
              Lihat Tracking
            </a>

          </div>

        )}

        {/* TOTAL */}

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <h2 className="text-xl font-bold mb-4">

            Ringkasan Pembayaran

          </h2>

          <div className="space-y-2">

            <div className="flex justify-between">

              <span>Subtotal</span>

              <span>
                Rp
                {Number(
                  order.subtotal || 0
                ).toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between">

              <span>Ongkir</span>

              <span>
                Rp
                {Number(
                  order.shippingCost || 0
                ).toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between border-t pt-4 font-bold text-xl">

              <span>Total</span>

              <span>
                Rp
                {Number(
                  order.total || 0
                ).toLocaleString()}
              </span>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}