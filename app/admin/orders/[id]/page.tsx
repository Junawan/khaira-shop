"use client";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useParams } from "next/navigation";

type OrderItem = {
  id: string;

  name: string;

  price: number;

  quantity: number;

  image?: string;
};

type Order = {
  id: string;

  orderId: string;

  customerName: string;

  phone: string;

  address: string;

  postalCode?: string;

  courier?: string;

  courierService?: string;

  shippingCost?: number;

  paymentStatus: string;

  orderStatus: string;

  total: number;

  items: OrderItem[];

  trackingNumber?: string;

  createdAt?: any;

  email?: string;

  shippingType?: string;
};

export default function AdminOrderDetailPage() {
  const params = useParams();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [shippingType, setShippingType] =
    useState("dropoff");

  const [generatingResi, setGeneratingResi] =
    useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const docRef = doc(
        db,
        "orders",
        params.id as string
      );

      const docSnap =
        await getDoc(docRef);

      if (docSnap.exists()) {
        const data =
          docSnap.data();

        setOrder({
          id: docSnap.id,

          ...(data as Omit<
            Order,
            "id"
          >),
        });

        setTrackingNumber(
          data.trackingNumber || ""
        );

        setShippingType(
          data.shippingType ||
            "dropoff"
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    status: string
  ) => {
    if (!order) return;

    try {
      await updateDoc(
        doc(db, "orders", order.id),
        {
          orderStatus: status,

          trackingNumber:
            trackingNumber || "",
        }
      );

      setOrder({
        ...order,

        orderStatus: status,

        trackingNumber,
      });

      await fetch(
        "/api/send-order-notification",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
  docId: order.id,

  orderId: order.orderId,

  customerName:
    order.customerName,

  phone: order.phone,

  address: order.address,

  courier: order.courier,

  courierService:
    order.courierService,

  items: order.items || [],
}),
        }
      );

      alert(
        `Status berhasil diubah menjadi ${status}`
      );
    } catch (error) {
      console.log(error);

      alert(
        "Gagal update status"
      );
    }
  };

  const saveTrackingNumber =
    async () => {
      if (!order) return;

      try {
        await updateDoc(
          doc(
            db,
            "orders",
            order.id
          ),
          {
            trackingNumber,

            shippingType,
          }
        );

        setOrder({
          ...order,

          trackingNumber,

          shippingType,
        });

        alert(
          "Resi berhasil disimpan"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Gagal menyimpan resi"
        );
      }
    };

  const generateResi =
    async () => {
      if (!order) return;

      try {
        setGeneratingResi(true);

        const response =
          await fetch(
            "/api/biteship/create-order",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                orderId:
                  order.id,

                shippingType,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.log(data);

          alert(
            data.error ||
              "Gagal generate resi"
          );

          return;
        }

        const newTrackingNumber =
          data.trackingNumber ||
          "";

        setTrackingNumber(
          newTrackingNumber
        );

        await updateDoc(
          doc(
            db,
            "orders",
            order.id
          ),
          {
            trackingNumber:
              newTrackingNumber,

            shippingType,

            courierTrackingId:
              data.courierTrackingId ||
              "",

            labelUrl:
              data.labelUrl || "",

            pickupRequested:
              shippingType ===
              "pickup",
          }
        );

        setOrder({
          ...order,

          trackingNumber:
            newTrackingNumber,

          shippingType,
        });

        alert(
          shippingType ===
            "pickup"
            ? "Pickup kurir berhasil dibuat"
            : "Resi berhasil dibuat"
        );

        fetchOrder();
      } catch (error) {
        console.log(error);

        alert(
          "Terjadi kesalahan"
        );
      } finally {
        setGeneratingResi(false);
      }
    };

  const printLabel =
    async () => {
      if (!order) return;

      try {
        const response =
          await fetch(
            `/api/shipping-label?orderId=${order.id}`
          );

        const data =
          await response.json();

        if (!data.url) {
          alert(
            "Label belum tersedia"
          );

          return;
        }

        window.open(
          data.url,
          "_blank"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Gagal membuka label"
        );
      }
    };

  const printInvoice =
    async () => {
      if (!order) return;

      try {
        window.open(
          `/api/invoice?orderId=${order.id}`,
          "_blank"
        );
      } catch (error) {
        console.log(error);
      }
    };

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
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          {/* HEADER */}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">

            <div>

              <h1 className="text-4xl font-bold">
                Detail Order
              </h1>

              <p className="mt-3 text-gray-500">
                {order.orderId}
              </p>

            </div>

            <div className="space-y-2 text-left md:text-right">

              <div>

                <span className="text-gray-500">
                  Payment:
                </span>

                <span className="ml-2 font-semibold capitalize">
                  {
                    order.paymentStatus
                  }
                </span>

              </div>

              <div>

                <span className="text-gray-500">
                  Status:
                </span>

                <span className="ml-2 font-semibold capitalize">
                  {
                    order.orderStatus
                  }
                </span>

              </div>

            </div>

          </div>

          {/* CUSTOMER + SHIPPING */}

          <div className="grid md:grid-cols-2 gap-6 mb-10">

            <div className="bg-gray-50 rounded-2xl p-6">

              <h2 className="font-bold mb-5">
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
                  {order.email}
                </p>

                <p>
                  {order.address}
                </p>

                <p>
                  {
                    order.postalCode
                  }
                </p>

              </div>

            </div>

            <div className="bg-gray-50 rounded-2xl p-6">

              <h2 className="font-bold mb-5">
                Pengiriman
              </h2>

              <div className="space-y-3 text-gray-700">

                <p>
                  Kurir:
                  {" "}
                  {order.courier ||
                    "-"}
                </p>

                <p>
                  Service:
                  {" "}
                  {order.courierService ||
                    "-"}
                </p>

                <p>
                  Tipe:
                  {" "}
                  <span className="capitalize">
                    {shippingType}
                  </span>
                </p>

                <p>
                  Ongkir:
                  {" "}
                  Rp
                  {(
                    order.shippingCost ||
                    0
                  ).toLocaleString()}
                </p>

                <p>
                  Resi:
                  {" "}
                  {trackingNumber ||
                    "-"}
                </p>

              </div>

            </div>

          </div>

          {/* PRODUCTS */}

          <div className="mb-10">

            <h2 className="text-2xl font-bold mb-5">
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
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                    )}

                    <div className="flex-1">

                      <h3 className="font-semibold text-lg">
                        {item.name}
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

          {/* SHIPPING TYPE */}

          <div className="mb-10">

            <h2 className="text-2xl font-bold mb-5">
              Metode Pengiriman
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <button
                onClick={() =>
                  setShippingType(
                    "dropoff"
                  )
                }
                className={`border rounded-2xl p-6 text-left transition ${
                  shippingType ===
                  "dropoff"
                    ? "border-black bg-black text-white"
                    : "border-gray-300"
                }`}
              >

                <h3 className="font-bold text-lg mb-2">
                  Drop Off
                </h3>

                <p className="text-sm opacity-80">
                  Admin kirim paket
                  sendiri ke kurir
                </p>

              </button>

              <button
                onClick={() =>
                  setShippingType(
                    "pickup"
                  )
                }
                className={`border rounded-2xl p-6 text-left transition ${
                  shippingType ===
                  "pickup"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300"
                }`}
              >

                <h3 className="font-bold text-lg mb-2">
                  Pickup Kurir
                </h3>

                <p className="text-sm opacity-80">
                  Kurir pickup paket
                  otomatis ke toko
                </p>

              </button>

            </div>

          </div>

          {/* TRACKING */}

          <div className="mb-10">

            <h2 className="text-2xl font-bold mb-5">
              Tracking & Resi
            </h2>

            <div className="flex flex-col md:flex-row gap-4">

              <input
                type="text"
                placeholder="Masukkan nomor resi"
                value={
                  trackingNumber
                }
                onChange={(e) =>
                  setTrackingNumber(
                    e.target.value
                  )
                }
                className="flex-1 border rounded-2xl px-5 py-4"
              />

              <button
                onClick={
                  saveTrackingNumber
                }
                className="bg-black text-white px-6 py-4 rounded-2xl"
              >
                Simpan Resi
              </button>

              <button
                onClick={
                  generateResi
                }
                disabled={
                  generatingResi
                }
                className="bg-blue-600 text-white px-6 py-4 rounded-2xl disabled:opacity-50"
              >
                {generatingResi
                  ? "Loading..."
                  : shippingType ===
                    "pickup"
                  ? "Pickup Kurir"
                  : "Generate Resi"}
              </button>

            </div>

          </div>

          {/* PRINT */}

          <div className="mb-10">

            <h2 className="text-2xl font-bold mb-5">
              Print Dokumen
            </h2>

            <div className="flex flex-wrap gap-4">

              <button
  onClick={() =>
    window.open(
      `/admin/orders/${order.id}/label`,
      "_blank"
    )
  }
  className="bg-purple-600 text-white px-6 py-4 rounded-2xl"
>
  Print Shipping Label
</button>

              <button
                onClick={
                  printInvoice
                }
                className="bg-orange-500 text-white px-6 py-4 rounded-2xl"
              >
                Print Invoice
              </button>

            </div>

          </div>

          {/* TOTAL */}

          <div className="bg-black text-white rounded-2xl p-6 mb-10">

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

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-4">

            <button
              onClick={() =>
                updateStatus(
                  "packed"
                )
              }
              className="bg-yellow-500 text-white px-6 py-4 rounded-2xl"
            >
              Packed
            </button>

            <button
              onClick={() =>
                updateStatus(
                  "shipped"
                )
              }
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl"
            >
              Shipped
            </button>

            <button
              onClick={() =>
                updateStatus(
                  "delivered"
                )
              }
              className="bg-green-600 text-white px-6 py-4 rounded-2xl"
            >
              Delivered
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}