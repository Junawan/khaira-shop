import { NextResponse } from "next/server";

const midtransClient = require("midtrans-client");

import adminDb from "@/lib/firebase-admin";

const db = adminDb;
const snap = new midtransClient.Snap({
  isProduction: false,

  serverKey:
    process.env
      .MIDTRANS_SERVER_KEY!,
});

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const orderId = `ORDER-${Date.now()}`;

    const subtotal =
      body.items.reduce(
        (
          acc: number,
          item: any
        ) =>
          acc +
          item.price *
            item.quantity,
        0
      );

    const shippingCost =
      body.shippingCost || 0;

    const total =
      subtotal + shippingCost;

    const itemDetails =
      body.items.map(
        (item: any) => ({
          id: item.id,

          name: item.name,

          quantity:
            item.quantity,

          price: item.price,
        })
      );

    // TAMBAHKAN ONGKIR
    if (shippingCost > 0) {
      itemDetails.push({
        id: "shipping",

        name: "Ongkos Kirim",

        quantity: 1,

        price: shippingCost,
      });
    }

    // SIMPAN ORDER KE FIRESTORE
    await db.collection("orders").add({
  orderId,

  // TAMBAHKAN INI
  midtransOrderId: orderId,

  customerName:
    body.name || "",

  phone:
    body.phone || "",

  address:
    body.address || "",

  postalCode:
    body.postalCode || "",

  note:
    body.note || "",

email:
  body.email || "",

  items:
    body.items || [],

  subtotal:
    subtotal || 0,

  shippingCost:
    shippingCost || 0,

  total:
    total || 0,

  courier:
    body.courier || "",

  courierService:
    body.courierService || "",

  paymentStatus:
    "pending",

  orderStatus:
    "pending",

  createdAt:
    new Date(),
});

    const parameter = {
      transaction_details: {
        order_id: orderId,

        gross_amount: total,
      },

      customer_details: {
        first_name:
          body.name,

        phone:
          body.phone,
      },

      item_details:
        itemDetails,
    };

    const transaction =
      await snap.createTransaction(
        parameter
      );

    return NextResponse.json({
      token:
        transaction.token,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Midtrans Error",
      },
      {
        status: 500,
      }
    );
  }
}