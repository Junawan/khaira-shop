"use client";

import {
  Suspense,
  useEffect,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get(
      "order_id"
    );

  useEffect(() => {
    console.log(
      "ORDER:",
      orderId
    );
  }, [orderId]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf7f2] p-6">
      <div className="bg-white p-10 rounded-3xl shadow-sm max-w-lg w-full text-center">

        <div className="text-6xl mb-4">
          ✅
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Pembayaran Berhasil
        </h1>

        <p className="text-gray-600 mb-6">
          Pesanan kamu berhasil
          diproses.
        </p>

        {orderId && (
          <div className="bg-gray-100 rounded-xl p-4 mb-6">

            <p className="text-sm text-gray-500">
              Order ID
            </p>

            <p className="font-bold">
              {orderId}
            </p>

          </div>
        )}

        <div className="flex flex-col gap-3">

          <Link
            href="/"
            className="bg-black text-white py-3 rounded-xl"
          >
            Kembali ke Home
          </Link>

          {orderId && (
            <Link
              href={`/tracking/${orderId}`}
              className="border border-black py-3 rounded-xl"
            >
              Tracking Pesanan
            </Link>
          )}

        </div>

      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}