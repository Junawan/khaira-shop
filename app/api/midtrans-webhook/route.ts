import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

import { resend } from "@/lib/resend";

import { sendWhatsApp } from "@/lib/fonnte";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: any = {};

    try {
      body = await req.json();
    } catch (err) {
      console.log(
        "INVALID JSON BODY"
      );

      return NextResponse.json({
        success: true,
        message:
          "Webhook received",
      });
    }

    console.log(
      "MIDTRANS WEBHOOK:",
      body
    );

    const orderId =
      body.order_id;

    const transactionStatus =
      body.transaction_status;

    // TEST NOTIFICATION MIDTRANS
    if (!orderId) {
      return NextResponse.json({
        success: true,
        message:
          "Webhook test success",
      });
    }

    // CARI ORDER
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

      return NextResponse.json({
        success: true,
        message:
          "Order not found",
      });
    }

    const orderDoc =
      snapshot.docs[0];

    const orderData =
      orderDoc.data();

    // PAYMENT SUCCESS
    const isPaid =
      transactionStatus ===
        "settlement" ||
      transactionStatus ===
        "capture";

    if (isPaid) {
      // CEGAH DUPLIKAT
      if (
        orderData.paymentStatus ===
        "paid"
      ) {
        return NextResponse.json({
          success: true,
          message:
            "Already paid",
        });
      }

      // UPDATE ORDER
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
                  <h2>
                    Pembayaran Berhasil ✅
                  </h2>

                  <p>
                    Halo ${orderData.customerName}
                  </p>

                  <p>
                    Pesanan berhasil dibayar.
                  </p>

                  <p>
                    Order ID:
                    ${orderData.orderId}
                  </p>

                  <p>
                    Total:
                    Rp${(
                      orderData.total || 0
                    ).toLocaleString()}
                  </p>
                `,
              }
            );

          console.log(
            "EMAIL:",
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
            "WA:",
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
        success: true,
        error:
          "Webhook handled",
      },
      {
        status: 200,
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