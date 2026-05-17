"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type Order = {
  id: string;

  orderId: string;

  customerName: string;

  phone: string;

  address: string;

  total: number;

  shippingCost: number;

  courier: string;

  courierService: string;

  orderStatus: string;

  paymentStatus: string;

  trackingNumber?: string;

  createdAt?: any;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot =
        await getDocs(q);

      const data: Order[] =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<
            Order,
            "id"
          >),
        }));

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (
    orderId: string,
    status: string
  ) => {
    try {
      await updateDoc(
        doc(db, "orders", orderId),
        {
          orderStatus: status,
        }
      );

      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-10">
          Admin Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm text-center">
            Belum ada order
          </div>
        ) : (
          <div className="space-y-6">

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                  {/* LEFT */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-3 mb-4">

                      <h2 className="text-2xl font-bold">
                        {order.customerName}
                      </h2>

                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {order.orderId}
                      </span>

                    </div>

                    <div className="space-y-1 text-gray-600">

                      <p>
                        {order.phone}
                      </p>

                      <p>
                        {order.address}
                      </p>

                    </div>

                    <div className="mt-6 grid md:grid-cols-2 gap-4">

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <p className="text-sm text-gray-500">
                          Total Belanja
                        </p>

                        <p className="text-xl font-bold mt-1">
                          Rp
                          {order.total?.toLocaleString()}
                        </p>

                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <p className="text-sm text-gray-500">
                          Ongkos Kirim
                        </p>

                        <p className="text-xl font-bold mt-1">
                          Rp
                          {order.shippingCost?.toLocaleString()}
                        </p>

                      </div>

                    </div>

                    <div className="mt-6 space-y-2">

                      <p>
                        <span className="font-semibold">
                          Kurir:
                        </span>
                        {" "}
                        {order.courier || "-"}
                      </p>

                      <p>
                        <span className="font-semibold">
                          Service:
                        </span>
                        {" "}
                        {order.courierService || "-"}
                      </p>

                      {order.trackingNumber && (
                        <p>
                          <span className="font-semibold">
                            Resi:
                          </span>
                          {" "}
                          {order.trackingNumber}
                        </p>
                      )}

                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          order.paymentStatus ===
                          "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Payment:
                        {" "}
                        {order.paymentStatus}
                      </span>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          order.orderStatus ===
                          "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.orderStatus ===
                              "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.orderStatus ===
                              "packed"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Status:
                        {" "}
                        {order.orderStatus}
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-wrap gap-3 lg:w-[320px]">

                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          "packed"
                        )
                      }
                      className="bg-orange-500 text-white px-5 py-3 rounded-2xl hover:opacity-90 transition"
                    >
                      Packed
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          "shipped"
                        )
                      }
                      className="bg-blue-600 text-white px-5 py-3 rounded-2xl hover:opacity-90 transition"
                    >
                      Shipped
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          "delivered"
                        )
                      }
                      className="bg-green-600 text-white px-5 py-3 rounded-2xl hover:opacity-90 transition"
                    >
                      Delivered
                    </button>

                    <Link
                      href={`/tracking/${order.orderId}`}
                    >
                      <button className="bg-black text-white px-5 py-3 rounded-2xl hover:opacity-90 transition">
                        Tracking
                      </button>
                    </Link>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>

    </main>
  );
}