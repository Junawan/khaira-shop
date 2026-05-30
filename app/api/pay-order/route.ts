import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const midtransClient = require("midtrans-client");

export const runtime = "nodejs";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID kosong",
        },
        {
          status: 400,
        }
      );
    }

    // cari order

    const orderQuery =
      await adminDb
        .collection("orders")
        .where(
          "orderId",
          "==",
          orderId
        )
        .limit(1)
        .get();

    if (orderQuery.empty) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pesanan tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const orderDoc =
      orderQuery.docs[0];

    const order =
      orderDoc.data();

    // sudah dibayar?

    if (
      order.paymentStatus ===
      "paid"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pesanan sudah dibayar",
        },
        {
          status: 400,
        }
      );
    }

    // buat token baru

    const transaction =
      await snap.createTransaction({

        transaction_details: {

          order_id:
            `${order.orderId}-${Date.now()}`,

          gross_amount:
            Number(order.total),
        },

        customer_details: {

          first_name:
            order.customerName,

          email:
            order.email,

          phone:
            order.phone,
        },

      });

    return NextResponse.json({
      success: true,
      token:
        transaction.token,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal membuat pembayaran",
      },
      {
        status: 500,
      }
    );
  }
}