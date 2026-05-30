//api-create-transaction

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendWhatsApp } from "@/lib/fonnte";

const midtransClient = require("midtrans-client");

export const runtime = "nodejs";

// =========================
// MIDTRANS
// =========================

const snap = new midtransClient.Snap({
  isProduction: true,

  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// =========================
// CREATE TRANSACTION
// =========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("CHECKOUT BODY:", body);

    const paymentMethod =
  body.paymentMethod || "midtrans";

    // =========================
    // ORDER ID
    // =========================

    const orderId = `ORDER-${Date.now()}`;

    // =========================
    // TOTAL
    // =========================

    const subtotal = body.items.reduce(
      (acc: number, item: any) =>
        acc + Number(item.price) * Number(item.quantity),
      0
    );

    const shippingCost = Number(body.shippingCost || 0);

    const total = subtotal + shippingCost;

    // =========================
    // ITEM DETAILS
    // =========================

    const itemDetails = body.items.map((item: any) => ({
      id: item.id || "product",

      price: Math.round(item.price),

      quantity: Number(item.quantity || 1),

      name:
  item.name.length > 50
    ? item.name.substring(0, 50)
    : item.name,
    }));

    // ONGKIR
    if (shippingCost > 0) {
      itemDetails.push({
        id: "shipping",

        price: shippingCost,

        quantity: 1,

        name: "Ongkos Kirim",
      });
    }

    // =========================
    // SAVE TO FIRESTORE
    // =========================
    // save

    const orderRef = await adminDb.collection("orders").add({
  uid: body.uid || "",

  orderId,

  midtransOrderId:
    paymentMethod === "midtrans"
      ? orderId
      : "",

  customerName: body.name || "",

  email: body.email || "",

  phone: body.phone || "",

  address: body.address || "",

  postalCode: body.postalCode || "",

  note: body.note || "",

  items: body.items || [],

  subtotal,

  shippingCost,

  total,

  courier: body.courier || "",

  courierService:
    body.courierService || "",

  paymentStatus:
    paymentMethod === "bca_qris"
      ? "waiting_proof"
      : "pending",

  paymentMethod,

  orderStatus: "pending",

  airwayBillId: "",

  trackingId: "",

  trackingLink: "",

  shippingType: "",

  paymentProofUrl: "",

  paymentProofStatus:
    paymentMethod === "bca_qris"
      ? "waiting_upload"
      : "",

      customerViewed: true,

customerArchived: false,

  createdAt: new Date(),

  updatedAt: new Date(),
});

    console.log("FIRESTORE ORDER ID:", orderRef.id);

    // =========================
// NOTIF ADMIN
// =========================

if (process.env.ADMIN_WHATSAPP) {
  await sendWhatsApp(
    process.env.ADMIN_WHATSAPP,
    `🛒 ORDER BARU

Order ID:
${orderId}

Customer:
${body.name}

No HP:
${body.phone}

Total:
Rp${total.toLocaleString()}

Pembayaran:
${paymentMethod}

Admin:
https://www.khairashop25.web.id/admin/orders`
  );
}

// =========================
// NOTIF CUSTOMER
// =========================

if (body.phone) {
  await sendWhatsApp(
    body.phone,
    `Terima kasih telah berbelanja di Khaira Shop ❤️

Order ID:
${orderId}

Total:
Rp${total.toLocaleString()}

Status:
Menunggu Pembayaran

Cek status pesanan:
https://www.khairashop25.web.id/tracking/${orderId}`
  );
}

    // =========================
// BCA QRIS STATIS
// =========================

if (paymentMethod === "bca_qris") {
  return NextResponse.json({
    success: true,

    paymentMethod: "bca_qris",

    orderId,

    firestoreDocId: orderRef.id,

    total,

    qrisImage:
      "/qris-bca.jpg",
  });
}

    // =========================
    // MIDTRANS PARAMETER
    // =========================

    const parameter = {
      transaction_details: {
        order_id: orderId,

        gross_amount: Math.round(total),
      },

      customer_details: {
        first_name: body.name,

        email: body.email,

        phone: body.phone,
      },

      item_details: itemDetails,
    };

    console.log("MIDTRANS PARAMETER:", parameter);

    // =========================
    // CREATE TRANSACTION
    // =========================

    const transaction = await snap.createTransaction(parameter);

    console.log("MIDTRANS RESPONSE:", transaction);

    return NextResponse.json({
      success: true,

      token: transaction.token,

      redirect_url: transaction.redirect_url,

      orderId,

      firestoreDocId: orderRef.id,
    });
  } catch (error: any) {
    console.log("MIDTRANS ERROR:", error);

    return NextResponse.json(
  {
    success: false,

    message:
      error instanceof Error
        ? error.message
        : "Midtrans error",
  },
  {
    status: 500,
  }
);
  }
}