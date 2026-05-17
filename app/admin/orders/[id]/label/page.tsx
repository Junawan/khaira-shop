"use client";

import { useEffect, useRef, useState } from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useParams } from "next/navigation";

import JsBarcode from "jsbarcode";

import * as QRCode from "qrcode";

type OrderItem = {
  id: string;

  name: string;

  quantity: number;
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

  trackingNumber?: string;

  total: number;

  items: OrderItem[];
};

export default function ShippingLabelPage() {
  const params = useParams();

  const barcodeRef =
    useRef<SVGSVGElement>(null);

  const [qrCode, setQrCode] =
    useState<string>("");

  const [loading, setLoading] =
    useState(true);

  const [order, setOrder] =
    useState<Order | null>(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    generateBarcodeAndQR();
  }, [order]);

  const generateBarcodeAndQR =
    async () => {
      try {
        if (
          !order ||
          !order.trackingNumber
        ) {
          return;
        }

        // BARCODE
        if (barcodeRef.current) {
          JsBarcode(
            barcodeRef.current,
            order.trackingNumber,
            {
              format: "CODE128",
              width: 2,
              height: 70,
              displayValue: false,
              margin: 0,
            }
          );
        }

        // QR
        const trackingUrl =
          `${window.location.origin}/tracking/${order.orderId}`;

        const qrDataUrl =
          await QRCode.toDataURL(
            trackingUrl
          );

        setQrCode(qrDataUrl);
      } catch (error) {
        console.log(error);
      }
    };

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
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const printLabel = () => {
    window.print();
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
    <main className="min-h-screen bg-gray-100 p-10">

      {/* BUTTON */}

      <div className="mb-6 no-print">

        <button
          onClick={printLabel}
          className="bg-black text-white px-6 py-4 rounded-2xl"
        >
          Print Label
        </button>

      </div>

      {/* LABEL */}

      <div
        className="bg-white mx-auto shadow-xl label-container"
        style={{
          width: "100mm",
          minHeight: "150mm",
          padding: "12mm",
        }}
      >

        {/* HEADER */}

        <div className="flex justify-between border-b pb-4">

          <div>

            <h1 className="text-3xl font-black">
              KHAIRASHOP25
            </h1>

            <p className="text-sm mt-1">
              Premium Bakeware
            </p>

          </div>

          <div className="text-right">

            <p className="text-xs">
              ORDER ID
            </p>

            <p className="font-bold">
              {order.orderId}
            </p>

          </div>

        </div>

        {/* RESI */}

        <div className="mt-6 border-2 border-black rounded-2xl p-5 text-center">

          <p className="text-sm mb-2">
            NOMOR RESI
          </p>

          <h2 className="text-4xl font-black break-all">
            {order.trackingNumber ||
              "-"}
          </h2>

        </div>

        {/* BARCODE */}

        <div className="mt-6 flex justify-center">

          <svg
            ref={barcodeRef}
          ></svg>

        </div>

        {/* QR */}

        <div className="mt-5 flex justify-center">

          {qrCode && (
            <img
              src={qrCode}
              alt="QR Code"
              className="w-36 h-36"
            />
          )}

        </div>

        {/* ADDRESS */}

        <div className="mt-8 border rounded-2xl p-5">

          <p className="text-xs mb-2">
            PENERIMA
          </p>

          <h3 className="font-bold text-lg">
            {order.customerName}
          </h3>

          <p className="mt-2">
            {order.phone}
          </p>

          <p className="mt-3 whitespace-pre-line">
            {order.address}
          </p>

          <p className="mt-3 font-bold">
            {order.postalCode}
          </p>

        </div>

        {/* SHIPPING */}

        <div className="mt-6 border rounded-2xl p-5">

          <p>
            Kurir:
            {" "}
            <span className="font-bold uppercase">
              {order.courier || "-"}
            </span>
          </p>

          <p className="mt-2">
            Service:
            {" "}
            <span className="font-bold">
              {order.courierService ||
                "-"}
            </span>
          </p>

        </div>

        {/* PRODUCTS */}

        <div className="mt-6 border rounded-2xl overflow-hidden">

          <div className="bg-black text-white px-4 py-3 font-bold">
            PRODUK
          </div>

          <div className="p-4 space-y-3">

            {order.items.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >

                  <div>
                    {item.name}
                  </div>

                  <div className="font-bold">
                    x
                    {item.quantity}
                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* PRINT STYLE */}

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .label-container {
            width: 100mm !important;
            min-height: 150mm !important;
            margin: 0 auto;
            box-shadow: none !important;
          }
        }
      `}</style>

    </main>
  );
}