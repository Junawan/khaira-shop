import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

import { resend } from "@/lib/resend";

import { sendWhatsApp } from "@/lib/fonnte";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "MIDTRANS WEBHOOK:",
      body
    );

    const orderId =
      body.order_id;

    const transactionStatus =
      body.transaction_status;

    console.log(
      "ORDER ID:",
      orderId
    );

    console.log(
      "TRANSACTION STATUS:",
      transactionStatus
    );

    // cari order
    const snapshot =
      await adminDb
        .collection("orders")
        .where(
          "orderId",
          "==",
          orderId
        )
        .get();

    if (snapshot.empty) {
      console.log(
        "ORDER NOT FOUND"
      );

      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const orderDoc =
      snapshot.docs[0];

    const orderData =
      orderDoc.data();

    console.log(
      "ORDER FOUND:",
      orderData
    );

    // hanya saat payment sukses
    if (
      transactionStatus ===
        "settlement" ||
      transactionStatus ===
        "capture"
    ) {
      // update firestore
      await orderDoc.ref.update({
        paymentStatus:
          "paid",

        orderStatus:
          "paid",

        paidAt: new Date(),
      });

      console.log(
        "ORDER UPDATED"
      );

      // =====================
      // EMAIL
      // =====================

      if (orderData.email) {
        try {
          const emailResult =
            await resend.emails.send(
              {
                from:
                  "Khaira Shop <noreply@ks25.my.id>",

                to: orderData.email,

                subject:
                  "Pembayaran Berhasil",

                html: `
                <h2>Pembayaran Berhasil ✅</h2>

                <p>Halo ${orderData.customerName}</p>

                <p>Pesanan kamu berhasil dibayar.</p>

                <p><strong>Order ID:</strong> ${orderData.orderId}</p>

                <p><strong>Total:</strong> Rp${(
                  orderData.total || 0
                ).toLocaleString()}</p>
              `,
              }
            );

          console.log(
            "EMAIL RESULT:",
            emailResult
          );
        } catch (err) {
          console.log(
            "EMAIL ERROR:",
            err
          );
        }
      }

      // =====================
      // WHATSAPP
      // =====================

      if (orderData.phone) {
        try {
          const waResult =
            await sendWhatsApp(
              orderData.phone,
              `Pembayaran berhasil ✅

Order ID:
${orderData.orderId}

Total:
Rp${(
                orderData.total || 0
              ).toLocaleString()}`
            );

          console.log(
            "WA RESULT:",
            waResult
          );
        } catch (err) {
          console.log(
            "WA ERROR:",
            err
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(
      "WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Webhook error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook active",
  });
}