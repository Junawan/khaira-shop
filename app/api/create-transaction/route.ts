import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

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
      orderId,

      midtransOrderId: orderId,

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

      courierService: body.courierService || "",

      paymentStatus: "pending",

      orderStatus: "pending",

      airwayBillId: "",

      trackingId: "",

      trackingLink: "",

      shippingType: "",

      createdAt: new Date(),

      updatedAt: new Date(),
    });

    console.log("FIRESTORE ORDER ID:", orderRef.id);

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