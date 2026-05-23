import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import axios from "axios";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("CHECKOUT BODY:", body);

    const orderId = `ORDER-${Date.now()}`;

    // =========================
    // TOTAL
    // =========================

    const subtotal = body.items.reduce(
      (acc: number, item: any) =>
        acc +
        Number(item.price) *
          Number(item.quantity),
      0
    );

    const shippingCost = Number(
      body.shippingCost || 0
    );

    const total =
      subtotal + shippingCost;

    // =========================
    // SAVE ORDER FIRESTORE
    // =========================

    const orderRef =
      await adminDb
        .collection("orders")
        .add({
          orderId,

          customerName:
            body.name || "",

          email:
            body.email || "",

          phone:
            body.phone || "",

          address:
            body.address || "",

          postalCode:
            body.postalCode || "",

          note:
            body.note || "",

          items:
            body.items || [],

          subtotal,

          shippingCost,

          total,

          courier:
            body.courier || "",

          courierService:
            body.courierService ||
            "",

          paymentStatus:
            "pending",

          orderStatus:
            "pending",

          createdAt: new Date(),

          updatedAt: new Date(),
        });

    // =========================
    // CREATE LOUVIN QRIS
    // =========================

    const response =
      await axios.post(
        "https://api.louvin.dev/create-transaction",
        {
          api_key:
            process.env
              .LOUVIN_API_KEY,

          slug:
            process.env
              .LOUVIN_SLUG,

          amount: total,

          external_id: orderId,

          customer_name:
            body.name,

          customer_email:
            body.email,

          customer_phone:
            body.phone,

          description:
            `Pembayaran Order ${orderId}`,

          success_redirect_url:
            "https://www.khairashop25.web.id/payment-success",

          expired_time: 1800,
        }
      );

    console.log(
      "LOUVIN RESPONSE:",
      response.data
    );

    if (!response.data?.success) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Gagal membuat QRIS",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,

      paymentUrl:
        response.data.payment_url,

      qrString:
        response.data.qr_string,

      qrImage:
        response.data.qr_image,

      orderId,

      firestoreDocId:
        orderRef.id,
    });
  } catch (error: any) {
    console.log(
      "LOUVIN ERROR:",
      error?.response?.data ||
        error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.response?.data ||
          "Louvin Error",
      },
      {
        status: 500,
      }
    );
  }
}