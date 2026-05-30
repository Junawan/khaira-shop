"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";

import {
  auth,
  db
} from "@/lib/firebase";

import {
  onAuthStateChanged
} from "firebase/auth";

import Link from "next/link";

export default function OrdersPage() {

  const [orders, setOrders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {
            setLoading(false);
            return;
          }

          const q = query(
            collection(db, "orders"),
            where("uid", "==", user.uid),
            orderBy("createdAt", "desc")
          );

          const snap =
            await getDocs(q);

          const data =
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

          setOrders(data);

          setLoading(false);
        }
      );

    return () => unsubscribe();

  }, []);

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Pesanan Saya
        </h1>

        {orders.length === 0 ? (

          <div className="bg-white rounded-3xl p-10 text-center">

            <p className="text-gray-500">
              Belum ada pesanan
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {orders.map((order) => (

              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
              >

                <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition">

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="font-bold">
                        {order.orderId}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {order.customerName}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="font-bold">
                        Rp
                        {Number(
                          order.total || 0
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap">

                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">

                      {order.paymentStatus}

                    </span>

                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">

                      {order.orderStatus}

                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}