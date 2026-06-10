"use client";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  getDocs,
  query,
  where,
  
} from "firebase/firestore";

import {
  db
} from "@/lib/firebase";

import {
  useParams
} from "next/navigation";

import Script from "next/script";

import { increment } from "firebase/firestore";

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

  const [reviewText, setReviewText] =
  useState("");

const [rating, setRating] =
  useState(5);

const [sendingReview, setSendingReview] =
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

const submitReview = async (
  product: any
) => {

  try {
    if (!reviewText.trim()) {
  alert("Tulis ulasan terlebih dahulu");
  return;
}

    setSendingReview(true);

    await addDoc(
      collection(db, "reviews"),
      {
        productId:
          product.id,

        productName:
          product.name,

        orderId:
          order.orderId,

        customerName:
          order.customerName,

        rating,

        review:
          reviewText,

        createdAt:
          serverTimestamp(),
      }
    );

    await updateDoc(doc(db, "products", product.id), {
  ratingSum: increment(rating),
  reviewCount: increment(1),
});

    alert(
      "Ulasan berhasil dikirim"
    );

    setReviewText("");

    setRating(5);

  } catch (error) {

    console.log(error);

    alert(
      "Gagal mengirim ulasan"
    );

  } finally {

    setSendingReview(false);

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

        {(
  order.paymentStatus ===
    "settlement" ||
  order.paymentStatus ===
    "capture"
) && (

  <div className="bg-white rounded-3xl p-6 shadow-sm">

    <h2 className="text-xl font-bold mb-4">

      Beri Ulasan

    </h2>

    <div className="space-y-6">

      {order.items?.map(
        (
          item: any,
          index: number
        ) => (

          <div
            key={index}
            className="border rounded-2xl p-4"
          >

            <p className="font-semibold mb-3">

              {item.name}

            </p>

            <select
              value={rating}
              onChange={(e) =>
                setRating(
                  Number(
                    e.target.value
                  )
                )
              }
              className="border rounded-lg px-3 py-2 mb-3"
            >

              <option value={5}>
                ⭐⭐⭐⭐⭐
              </option>

              <option value={4}>
                ⭐⭐⭐⭐
              </option>

              <option value={3}>
                ⭐⭐⭐
              </option>

              <option value={2}>
                ⭐⭐
              </option>

              <option value={1}>
                ⭐
              </option>

            </select>

            <textarea
              value={reviewText}
              onChange={(e) =>
                setReviewText(
                  e.target.value
                )
              }
              placeholder="Tulis ulasan..."
              className="w-full border rounded-xl p-3 mb-3"
            />

            <button
              onClick={() =>
                submitReview(
                  item
                )
              }
              disabled={
                sendingReview
              }
              className="bg-green-600 text-white px-5 py-2 rounded-xl"
            >

              {sendingReview
                ? "Mengirim..."
                : "Kirim Ulasan"}

            </button>

          </div>

        )
      )}

    </div>

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