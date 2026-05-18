"use client";

import Link from "next/link";

import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get(
      "order_id"
    );

  return (
    <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-sm max-w-lg w-full p-10 text-center">

        <div className="text-6xl mb-6">
          ✅
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Pembayaran Berhasil
        </h1>

        <p className="text-gray-600 mb-8">
          Terima kasih sudah
          berbelanja di
          Khaira Shop.
        </p>

        {orderId && (
          <div className="bg-gray-100 rounded-2xl p-4 mb-8">

            <p className="text-sm text-gray-500">
              Order ID
            </p>

            <p className="font-bold text-lg break-all">
              {orderId}
            </p>

          </div>
        )}

        <div className="space-y-4">

          {orderId && (
            <Link
              href={`/tracking/${orderId}`}
              className="block w-full bg-black text-white py-4 rounded-2xl font-semibold"
            >
              Tracking Pesanan
            </Link>
          )}

          <Link
            href="/"
            className="block w-full border border-gray-300 py-4 rounded-2xl font-semibold"
          >
            Kembali Belanja
          </Link>

        </div>

      </div>

    </main>
  );
}