"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";

import { signOut } from "firebase/auth";

import { useRouter } from "next/navigation";

type OrderItem = {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
};

type Order = {
  id: string;
  orderId: string;

  customerName: string;
  email?: string;

  phone: string;
  address: string;
  postalCode: string;

  total: number;
  shippingCost: number;

  courier: string;
  courierService: string;

  orderStatus: string;
  paymentStatus: string;

  paymentMethod?: string;

  paymentProofUrl?: string;

  paymentProofStatus?: string;

  trackingNumber?: string;

  airwayBillId?: string;
  trackingId?: string;
  trackingLink?: string;
  shippingType?: string;

  biteshipOrderId?: string;
  biteshipLabel?: string;

  createdAt?: any;
  items?: OrderItem[];
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState("all");

    const [search, setSearch] =
  useState("");

  const [processingId, setProcessingId] =
    useState<string | null>(null);

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Order[] =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<
              Order,
              "id"
            >),
          }));

        setOrders(data);

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    try {
      await signOut(auth);

      document.cookie =
        "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      router.push("/login-admin");
    } catch (error) {
      console.log(error);
    }
  };

  // UPDATE STATUS
  const updateStatus = async (
    docId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
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
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Gagal update status"
        );

        return;
      }

      alert(
        "Status berhasil diupdate"
      );
    } catch (error) {
      console.log(error);

      alert("Terjadi kesalahan");
    }
  };

  // SIMPAN RESI MANUAL
  const saveTrackingNumber = async (
    docId: string
  ) => {
    try {
      const trackingNumber =
  trackingInputs[docId] ||
  orders.find(
    (o) => o.id === docId
  )?.trackingNumber ||
  orders.find(
    (o) => o.id === docId
  )?.airwayBillId;

      if (!trackingNumber) {
        alert("Masukkan nomor resi");

        return;
      }

      const response = await fetch(
        "/api/orders/update-status",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            docId,
            status: "shipped",
            trackingNumber,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Gagal simpan resi"
        );

        return;
      }

      alert("Resi berhasil disimpan");
    } catch (error) {
      console.log(error);

      alert("Terjadi kesalahan");
    }
  };

  // CREATE BITESHIP
  const createBiteshipOrder = async (
    order: Order,
    type: "pickup" | "dropoff"
  ) => {
    try {
      setProcessingId(order.id);

      console.log(
        "ORDER DATA:",
        order
      );

      const response = await fetch(
        "/api/biteship/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            type,

            docId: order.id,

            orderId: order.orderId,

            customerName:
              order.customerName,

            email: order.email,

            phone: order.phone,

            address: order.address,

            postalCode:
              order.postalCode,

            courier: order.courier,

            courierService:
              order.courierService,

            items: order.items || [],
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "BITESHIP RESPONSE:",
        data
      );

      if (!response.ok) {
        alert(
          data.error ||
            "Gagal membuat order biteship"
        );

        return;
      }

      // UPDATE UI LANGSUNG
      if (data.success) {
  setOrders((prev: Order[]) =>
    prev.map((item) =>
      item.id === order.id
        ? {
            ...item,

            airwayBillId:
              data.airwayBillId,

            // IMPORTANT
            trackingNumber:
              data.airwayBillId,

            trackingId:
              data.trackingId,

            trackingLink:
              data.trackingLink,

            shippingType:
              data.shippingType,

            biteshipOrderId:
              data.biteshipOrderId ||
              item.biteshipOrderId,
          }
        : item
    )
  );
}

      alert(
        type === "pickup"
          ? "Pickup berhasil dibuat"
          : "Dropoff berhasil dibuat"
      );
    } catch (error) {
      console.log(error);

      alert("Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  };

  // FILTER
  const filteredOrders = orders.filter(
  (order) => {
    // FILTER STATUS
    const matchFilter =
      filter === "all"
        ? true
        : order.orderStatus ===
          filter;

    // SEARCH
    const keyword =
      search.toLowerCase();

    const matchSearch =
      order.customerName
        ?.toLowerCase()
        .includes(keyword) ||
      order.orderId
        ?.toLowerCase()
        .includes(keyword) ||
      order.trackingNumber
        ?.toLowerCase()
        .includes(keyword) ||
      order.airwayBillId
        ?.toLowerCase()
        .includes(keyword);

    return (
      matchFilter && matchSearch
    );
  }
);

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
          <h1 className="text-4xl font-bold">
            Admin Orders
          </h1>

          <div className="flex flex-wrap gap-3 items-center">

  <input
    type="text"
    placeholder="Cari nama, order id, resi..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    className="px-4 py-3 rounded-2xl border w-[280px]"
  />

  <button
    onClick={handleLogout}
    className="bg-red-500 text-white px-5 py-3 rounded-2xl"
  >
    Logout
  </button>

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
                className={`px-4 py-2 rounded-2xl ${
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
          <div className="bg-white p-10 rounded-3xl text-center">
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
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <h2 className="text-2xl font-bold">
                          {
                            order.customerName
                          }
                        </h2>

                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {order.orderId}
                        </span>
                      </div>

                      <div className="space-y-1 text-gray-600">
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
                          Kode Pos:{" "}
                          {
                            order.postalCode
                          }
                        </p>
                      </div>

                      {/* ITEMS */}
                      <div className="mt-6">
                        <h3 className="font-bold mb-3">
                          Produk
                        </h3>

                        <div className="space-y-3">
                          {order.items?.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={
                                  item.id ||
                                  index
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
                                    Qty:{" "}
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

                      {/* TOTAL */}
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
                            {order.shippingCost.toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-black text-white rounded-2xl p-4">
                          <p className="text-sm opacity-80">
                            Total
                          </p>

                          <p className="text-2xl font-bold mt-1">
                            Rp
                            {order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* SHIPPING */}
<div className="mt-6 space-y-2">
  <p>
    <span className="font-semibold">
      Kurir:
    </span>{" "}
    {order.courier}
  </p>

  <p>
    <span className="font-semibold">
      Service:
    </span>{" "}
    {order.courierService}
  </p>

  {/* AIRWAY BILL */}
  {order.airwayBillId && (
    <p className="text-green-700 font-semibold">
      <span className="font-bold">
        Resi:
      </span>{" "}
      {order.airwayBillId}
    </p>
  )}

  {/* TRACKING ID */}
  {order.trackingId && (
    <p>
      <span className="font-semibold">
        Tracking ID:
      </span>{" "}
      {order.trackingId}
    </p>
  )}

  {/* SHIPPING TYPE */}
  {order.shippingType && (
    <p>
      <span className="font-semibold">
        Shipping:
      </span>{" "}
      {order.shippingType}
    </p>
  )}

  {/* TRACKING LINK */}
  {order.trackingLink && (
    <a
      href={order.trackingLink}
      target="_blank"
      className="text-blue-600 underline"
    >
      Lacak Paket
    </a>
  )}

  {order.biteshipOrderId && (
    <p>
      <span className="font-semibold">
        Biteship ID:
      </span>{" "}
      {order.biteshipOrderId}
    </p>
  )}
</div>

                      {/* BADGES */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                          Payment:{" "}
                          {
                            order.paymentStatus
                          }
                        </span>

                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                          Status:{" "}
                          {
                            order.orderStatus
                          }
                        </span>
                      </div>
                    </div>

                    {/* BUKTI PEMBAYARAN QRIS */}

{order.paymentMethod === "bca_qris" &&
  order.paymentProofUrl && (
    <div className="mt-6 border rounded-2xl p-5 bg-yellow-50">

      <h3 className="font-bold mb-4">
        Bukti Pembayaran QRIS
      </h3>

      <img
        src={order.paymentProofUrl}
        alt="Bukti Pembayaran"
        className="w-64 rounded-xl border"
      />

      <p className="mt-3 text-sm text-gray-600">
        Status:
        {" "}
        {order.paymentProofStatus}
      </p>

    </div>
)}

                    {/* RIGHT */}
                    <div className="xl:w-[320px] space-y-4">
                      {/* RESI */}
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="font-semibold mb-3">
                          Input Resi Manual
                        </p>

                        <input
                          type="text"
                          placeholder="Nomor resi"
                          value={
                            trackingInputs[
                              order.id
                            ] ||
                            order.trackingNumber ||
                            ""
                          }
                          onChange={(e) =>
                            setTrackingInputs(
                              (
                                prev
                              ) => ({
                                ...prev,

                                [order.id]:
                                  e.target
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

                      {/* ACTIONS */}
                      <div className="flex flex-col gap-3">
                        <button
                          disabled={
                            processingId ===
                            order.id
                          }
                          onClick={() =>
                            createBiteshipOrder(
                              order,
                              "pickup"
                            )
                          }
                          className="bg-purple-600 text-white py-3 rounded-2xl disabled:opacity-50"
                        >
                          {processingId ===
                          order.id
                            ? "Processing..."
                            : "Proses Pickup"}
                        </button>

                        <button
                          disabled={
                            processingId ===
                            order.id
                          }
                          onClick={() =>
                            createBiteshipOrder(
                              order,
                              "dropoff"
                            )
                          }
                          className="bg-pink-600 text-white py-3 rounded-2xl disabled:opacity-50"
                        >
                          {processingId ===
                          order.id
                            ? "Processing..."
                            : "Proses Dropoff"}
                        </button>

                        {order.paymentMethod === "bca_qris" &&
 order.paymentStatus === "waiting_proof" && (
  <button
    onClick={() =>
      updateStatus(order.id, "paid")
    }
    className="bg-green-600 text-white py-3 rounded-2xl"
  >
    Verifikasi Pembayaran
  </button>
)}

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
  onClick={() =>
    window.open(
      `/api/generate-invoice?orderId=${order.id}`,
      "_blank"
    )
  }
  className="w-full bg-black text-white py-4 rounded-2xl font-semibold"
>
  Cetak Invoice PDF
</button>

                        {order.biteshipLabel && (
                          <a
                            href={
                              order.biteshipLabel
                            }
                            target="_blank"
                            className="w-full"
                          >
                            <button className="w-full bg-black text-white py-3 rounded-2xl">
                              Cetak Thermal
                            </button>
                          </a>
                        )}
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