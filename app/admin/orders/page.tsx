"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  collection,
  onSnapshot,
  orderBy,
  query,

} from "firebase/firestore";

import { db } from "@/lib/firebase";

type OrderItem = {
  id: string;

  name: string;

  quantity: number;

  price: number;
};

type Order = {
  id: string;

  orderId: string;

  customerName: string;

  email?: string;

  phone: string;

  address: string;

  total: number;

  shippingCost: number;

  courier: string;

  courierService: string;

  orderStatus: string;

  paymentStatus: string;

  trackingNumber?: string;

  items?: OrderItem[];

  createdAt?: any;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState("all");

  const [trackingInputs, setTrackingInputs] =
    useState<{
      [key: string]: string;
    }>({});

  // REALTIME FIRESTORE
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {
          const data: Order[] =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<
                  Order,
                  "id"
                >),
              })
            );

          setOrders(data);

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // UPDATE STATUS
  const updateStatus = async (
  docId: string,
  status: string
) => {
  try {
    const trackingNumber =
      trackingInputs[docId] || "";

    const response =
      await fetch(
        "/api/orders/update-status",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            docId,

            status,

            trackingNumber,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      console.log(data);

      alert(
        "Gagal update status"
      );

      return;
    }

    alert(
      `Status berhasil diubah ke ${status}`
    );
  } catch (error) {
    console.log(error);

    alert(
      "Terjadi error"
    );
  }
};

  // SAVE RESI
  const saveTrackingNumber =
  async (docId: string) => {
    try {
      const trackingNumber =
        trackingInputs[docId];

      if (!trackingNumber) {
        alert(
          "Masukkan nomor resi"
        );

        return;
      }

      const response =
        await fetch(
          "/api/orders/update-status",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              docId,

              status: "packed",

              trackingNumber,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        console.log(data);

        alert(
          "Gagal simpan resi"
        );

        return;
      }

      alert(
        "Resi berhasil disimpan"
      );
    } catch (error) {
      console.log(error);

      alert(
        "Terjadi error"
      );
    }
  };

  // FILTER
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.orderStatus ===
            filter
        );

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

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">

          <h1 className="text-4xl font-bold">
            Admin Orders
          </h1>

          {/* FILTER */}

          <div className="flex flex-wrap gap-3">

            {[
              "all",
              "pending",
              "paid",
              "packed",
              "shipped",
              "delivered",
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  setFilter(item)
                }
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
                  filter === item
                    ? "bg-black text-white"
                    : "bg-white border"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </div>

        {/* EMPTY */}

        {filteredOrders.length ===
        0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm text-center">
            Tidak ada order
          </div>
        ) : (
          <div className="space-y-6">

            {filteredOrders.map(
              (order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 shadow-sm"
                >

                  <div className="flex flex-col xl:flex-row gap-8">

                    {/* LEFT */}

                    <div className="flex-1">

                      {/* TOP */}

                      <div className="flex flex-wrap items-center gap-3 mb-5">

                        <h2 className="text-2xl font-bold">
                          {
                            order.customerName
                          }
                        </h2>

                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">

                          {
                            order.orderId
                          }

                        </span>

                      </div>

                      {/* CUSTOMER */}

                      <div className="space-y-1 text-gray-600">

                        <p>
                          {
                            order.phone
                          }
                        </p>

                        <p>
                          {
                            order.email
                          }
                        </p>

                        <p>
                          {
                            order.address
                          }
                        </p>

                      </div>

                      {/* PRODUCTS */}

                      <div className="mt-6">

                        <h3 className="font-bold mb-3">
                          Produk
                        </h3>

                        <div className="space-y-3">

                          {order.items?.map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                                className="bg-gray-50 rounded-2xl p-4 flex justify-between"
                              >

                                <div>
                                  <p className="font-medium">
                                    {
                                      item.name
                                    }
                                  </p>

                                  <p className="text-sm text-gray-500">
                                    Qty:
                                    {" "}
                                    {
                                      item.quantity
                                    }
                                  </p>
                                </div>

                                <p className="font-semibold">
                                  Rp
                                  {(
                                    item.price *
                                    item.quantity
                                  ).toLocaleString()}
                                </p>

                              </div>
                            )
                          )}

                        </div>

                      </div>

                      {/* PRICE */}

                      <div className="mt-6 grid md:grid-cols-3 gap-4">

                        <div className="bg-gray-50 rounded-2xl p-4">

                          <p className="text-sm text-gray-500">
                            Subtotal
                          </p>

                          <p className="text-xl font-bold mt-1">
                            Rp
                            {(
                              order.total -
                              order.shippingCost
                            ).toLocaleString()}
                          </p>

                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4">

                          <p className="text-sm text-gray-500">
                            Ongkir
                          </p>

                          <p className="text-xl font-bold mt-1">
                            Rp
                            {order.shippingCost?.toLocaleString()}
                          </p>

                        </div>

                        <div className="bg-black text-white rounded-2xl p-4">

                          <p className="text-sm opacity-80">
                            Total
                          </p>

                          <p className="text-2xl font-bold mt-1">
                            Rp
                            {order.total?.toLocaleString()}
                          </p>

                        </div>

                      </div>

                      {/* SHIPPING */}

                      <div className="mt-6 space-y-2">

                        <p>

                          <span className="font-semibold">
                            Kurir:
                          </span>

                          {" "}
                          {
                            order.courier
                          }

                        </p>

                        <p>

                          <span className="font-semibold">
                            Service:
                          </span>

                          {" "}
                          {
                            order.courierService
                          }

                        </p>

                        {order.trackingNumber && (
                          <p>

                            <span className="font-semibold">
                              Resi:
                            </span>

                            {" "}
                            {
                              order.trackingNumber
                            }

                          </p>
                        )}

                      </div>

                      {/* BADGES */}

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
                          {
                            order.paymentStatus
                          }
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
                          {
                            order.orderStatus
                          }
                        </span>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="xl:w-[320px] space-y-4">

                      {/* INPUT RESI */}

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <p className="font-semibold mb-3">
                          Input Resi
                        </p>

                        <input
                          type="text"
                          placeholder="Masukkan nomor resi"
                          value={
                            trackingInputs[
                              order.id
                            ] ||
                            order.trackingNumber ||
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            setTrackingInputs(
                              (
                                prev
                              ) => ({
                                ...prev,
                                [order.id]:
                                  e
                                    .target
                                    .value,
                              })
                            )
                          }
                          className="w-full border rounded-xl px-4 py-3"
                        />

                        <button
                          onClick={() =>
                            saveTrackingNumber(
                              order.id
                            )
                          }
                          className="w-full mt-3 bg-black text-white py-3 rounded-xl"
                        >
                          Simpan Resi
                        </button>

                      </div>

                      {/* ACTION */}

                      <div className="flex flex-col gap-3">

                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "packed"
                            )
                          }
                          className="bg-orange-500 text-white py-3 rounded-2xl"
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
                          className="bg-blue-600 text-white py-3 rounded-2xl"
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
                          className="bg-green-600 text-white py-3 rounded-2xl"
                        >
                          Delivered
                        </button>

                        <Link
                          href={`/tracking/${order.orderId}`}
                        >
                          <button className="w-full bg-gray-900 text-white py-3 rounded-2xl">

                            Tracking Customer

                          </button>
                        </Link>

                        <button
  onClick={async () => {
    try {
      const response =
        await fetch(
          "/api/biteship/track"
        );

      const data =
        await response.json();

      console.log(data);

      alert(
        "Tracking berhasil disync"
      );
    } catch (error) {
      console.log(error);

      alert(
        "Gagal sync tracking"
      );
    }
  }}
  className="bg-purple-600 text-white px-5 py-3 rounded-2xl hover:opacity-90 transition"
>
  Sync Tracking
</button>

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </main>
  );
}