"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useParams } from "next/navigation";

type TrackingHistory = {
  note: string;

  status: string;

  updated_at: string;
};

type TimelineItem = {
  status: string;

  createdAt: string;
};

type OrderItem = {
  id: string;

  name: string;

  quantity: number;

  price: number;

  image?: string;
};

type Order = {
  id: string;

  orderId: string;

  customerName: string;

  phone: string;

  address: string;

  paymentStatus: string;

  orderStatus: string;

  trackingNumber?: string;

  courier?: string;

  courierService?: string;

  shippingCost?: number;

  total: number;

  items: OrderItem[];

  trackingHistory?: TrackingHistory[];

  timeline?: TimelineItem[];
};

export default function TrackingPage() {
  const params = useParams();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!params.orderId) return;

    const q = query(
      collection(db, "orders"),
      where(
        "orderId",
        "==",
        String(params.orderId)
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const orderDoc =
            snapshot.docs[0];

          const data =
            orderDoc.data();

          setOrder({
            id: orderDoc.id,

            ...(data as Omit<
              Order,
              "id"
            >),
          });
        }

        setLoading(false);
      });

    return () => unsubscribe();
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-xl font-semibold">
          Loading...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-xl font-semibold">
          Order tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          {/* HEADER */}

          <div className="mb-10">

            <h1 className="text-4xl font-bold">
              Tracking Pesanan
            </h1>

            <p className="text-gray-500 mt-3">
              {order.orderId}
            </p>

          </div>

          {/* STATUS */}

          <div className="grid md:grid-cols-2 gap-6 mb-10">

            <div className="bg-gray-50 rounded-2xl p-6">

              <h2 className="text-xl font-bold mb-5">
                Status Pesanan
              </h2>

              <div className="space-y-3 text-gray-700">

                <div className="flex justify-between">

                  <span>
                    Payment
                  </span>

                  <span className="font-semibold capitalize">
                    {
                      order.paymentStatus
                    }
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Order
                  </span>

                  <span className="font-semibold capitalize">
                    {
                      order.orderStatus
                    }
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Kurir
                  </span>

                  <span className="font-semibold uppercase">
                    {order.courier ||
                      "-"}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Service
                  </span>

                  <span className="font-semibold">
                    {order.courierService ||
                      "-"}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Resi
                  </span>

                  <span className="font-semibold">
                    {order.trackingNumber ||
                      "-"}
                  </span>

                </div>

              </div>

            </div>

            {/* CUSTOMER */}

            <div className="bg-gray-50 rounded-2xl p-6">

              <h2 className="text-xl font-bold mb-5">
                Customer
              </h2>

              <div className="space-y-3 text-gray-700">

                <p>
                  {
                    order.customerName
                  }
                </p>

                <p>
                  {order.phone}
                </p>

                <p>
                  {order.address}
                </p>

              </div>

            </div>

          </div>

          {/* ORDER TIMELINE */}

          <div className="mb-12">

            <h2 className="text-2xl font-bold mb-6">
              Timeline Order
            </h2>

            <div className="space-y-5">

              {order.timeline &&
              order.timeline.length >
                0 ? (
                order.timeline.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="flex gap-4"
                    >

                      <div className="flex flex-col items-center">

                        <div className="w-4 h-4 rounded-full bg-black"></div>

                        {index !==
                          order
                            .timeline!
                            .length -
                            1 && (
                          <div className="w-[2px] h-full bg-gray-300"></div>
                        )}

                      </div>

                      <div className="pb-8">

                        <p className="font-semibold capitalize">
                          {
                            item.status
                          }
                        </p>

                        <p className="text-sm text-gray-400 mt-2">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 text-gray-500">
                  Belum ada timeline order
                </div>
              )}

            </div>

          </div>

          {/* LIVE COURIER TRACKING */}

          <div className="mb-12">

            <h2 className="text-2xl font-bold mb-6">
              Live Tracking Kurir
            </h2>

            <div className="space-y-5">

              {order.trackingHistory &&
              order
                .trackingHistory
                .length > 0 ? (
                order.trackingHistory.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="flex gap-4"
                    >

                      <div className="flex flex-col items-center">

                        <div className="w-4 h-4 rounded-full bg-green-600"></div>

                        {index !==
                          order
                            .trackingHistory!
                            .length -
                            1 && (
                          <div className="w-[2px] h-full bg-gray-300"></div>
                        )}

                      </div>

                      <div className="pb-8">

                        <p className="font-semibold capitalize">
                          {
                            item.status
                          }
                        </p>

                        <p className="text-gray-600 mt-1">
                          {
                            item.note
                          }
                        </p>

                        <p className="text-sm text-gray-400 mt-2">
                          {
                            item.updated_at
                          }
                        </p>

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 text-gray-500">
                  Belum ada tracking pengiriman
                </div>
              )}

            </div>

          </div>

          {/* PRODUCTS */}

          <div className="mb-10">

            <h2 className="text-2xl font-bold mb-6">
              Produk
            </h2>

            <div className="space-y-4">

              {order.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-2xl p-5 flex items-center gap-5"
                  >

                    {item.image ? (
                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                        className="w-24 h-24 object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                    )}

                    <div className="flex-1">

                      <h3 className="font-semibold text-lg">
                        {
                          item.name
                        }
                      </h3>

                      <p className="text-gray-500 mt-1">
                        Qty:
                        {" "}
                        {
                          item.quantity
                        }
                      </p>

                    </div>

                    <div className="font-bold text-lg">

                      Rp
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString()}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          {/* TOTAL */}

          <div className="bg-black text-white rounded-2xl p-6">

            <div className="flex items-center justify-between">

              <span className="text-xl">
                Total
              </span>

              <span className="text-3xl font-bold">

                Rp
                {order.total.toLocaleString()}

              </span>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}