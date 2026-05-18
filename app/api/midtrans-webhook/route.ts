import { NextResponse } from "next/server";

export const runtime = "nodejs";

import adminDb from "@/lib/firebase-admin";

import { resend } from "@/lib/resend";

import { sendWhatsApp } from "@/lib/fonnte";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "MIDTRANS WEBHOOK:",
      JSON.stringify(body, null, 2)
    );

    const orderId =
      body.order_id;

    const transactionStatus =
      body.transaction_status;

    const fraudStatus =
      body.fraud_status;

    const paymentType =
      body.payment_type;

    // VALIDASI ORDER ID
    if (!orderId) {
      return NextResponse.json(
        {
          error:
            "Order ID kosong",
        },
        {
          status: 400,
        }
      );
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
        .limit(1)
        .get();

    // ORDER TIDAK DITEMUKAN
    if (snapshot.empty) {
      console.log(
        "ORDER TIDAK DITEMUKAN:",
        orderId
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

    const orderRef =
      orderDoc.ref;

    const orderData =
      orderDoc.data();

    console.log(
      "ORDER DITEMUKAN:",
      orderData.orderId
    );

    // =========================
    // STATUS PEMBAYARAN
    // =========================

    const isPaid =
      transactionStatus ===
        "settlement" ||
      transactionStatus ===
        "capture";

    const isPending =
      transactionStatus ===
      "pending";

    const isFailed =
      transactionStatus ===
        "deny" ||
      transactionStatus ===
        "cancel" ||
      transactionStatus ===
        "expire";

    // =========================
    // PAYMENT SUCCESS
    // =========================

    if (isPaid) {
      // FRAUD CHECK
      if (
        transactionStatus ===
          "capture" &&
        fraudStatus &&
        fraudStatus !==
          "accept"
      ) {
        console.log(
          "FRAUD DETECTED"
        );

        return NextResponse.json({
          success: false,

          message:
            "Fraud detected",
        });
      }

      // CEGAH DUPLIKAT
      if (
        orderData.paymentStatus ===
        "paid"
      ) {
        console.log(
          "ORDER SUDAH PAID"
        );

        return NextResponse.json({
          success: true,

          message:
            "Order already paid",
        });
      }

      // UPDATE FIRESTORE
      await orderRef.update({
        paymentStatus:
          "paid",

        orderStatus:
          "paid",

        paymentMethod:
          paymentType || "",

        transactionStatus,

        paidAt:
          new Date(),

        updatedAt:
          new Date(),
      });

      console.log(
        "ORDER UPDATED TO PAID"
      );

      // GANTI DENGAN DOMAIN VERCEL
      const trackingUrl = `https://khairashop25.vercel.app/tracking/${orderData.orderId}`;

      // =========================
      // SEND EMAIL
      // =========================

      if (orderData.email) {
        try {
          const emailResult =
            await resend.emails.send(
              {
                from:
                  "Khaira Shop <onboarding@resend.dev>",

                to:
                  orderData.email,

                subject:
                  "Pembayaran Berhasil ✅",

                html: `
                <div style="font-family:sans-serif;max-width:600px;margin:auto">

                  <h2>
                    Pembayaran Berhasil ✅
                  </h2>

                  <p>
                    Halo ${
                      orderData.customerName ||
                      "Customer"
                    },
                  </p>

                  <p>
                    Pesanan kamu berhasil dibayar dan sedang diproses.
                  </p>

                  <div style="background:#f5f5f5;padding:16px;border-radius:12px;margin-top:20px">

                    <p>
                      <strong>Order ID:</strong>
                      ${
                        orderData.orderId
                      }
                    </p>

                    <p>
                      <strong>Total:</strong>
                      Rp${(
                        orderData.total ||
                        0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </p>

                    <p>
                      <strong>Pembayaran:</strong>
                      ${
                        paymentType ||
                        "-"
                      }
                    </p>

                  </div>

                  <a
                    href="${trackingUrl}"
                    style="
                      display:inline-block;
                      margin-top:24px;
                      background:black;
                      color:white;
                      padding:14px 24px;
                      text-decoration:none;
                      border-radius:10px;
                    "
                  >
                    Tracking Pesanan
                  </a>

                  <p style="margin-top:30px;font-size:14px;color:#666">
                    Terima kasih sudah berbelanja di Khaira Shop ❤️
                  </p>

                </div>
                `,
              }
            );

          console.log(
            "EMAIL SENT:",
            emailResult
          );
        } catch (emailError) {
          console.log(
            "EMAIL ERROR:",
            emailError
          );
        }
      } else {
        console.log(
          "EMAIL CUSTOMER KOSONG"
        );
      }

      // =========================
      // SEND WHATSAPP
      // =========================

      if (orderData.phone) {
        try {
          const message = `Pembayaran berhasil ✅

Order ID:
${orderData.orderId}

Total:
Rp${(
            orderData.total || 0
          ).toLocaleString(
            "id-ID"
          )}

Pembayaran:
${paymentType || "-"}

Tracking:
${trackingUrl}

Terima kasih sudah berbelanja di Khaira Shop ❤️`;

          const waResult =
            await sendWhatsApp(
              orderData.phone,
              message
            );

          console.log(
            "WHATSAPP SENT:",
            waResult
          );
        } catch (waError) {
          console.log(
            "WHATSAPP ERROR:",
            waError
          );
        }
      } else {
        console.log(
          "PHONE CUSTOMER KOSONG"
        );
      }
    }

    // =========================
    // PAYMENT PENDING
    // =========================

    if (isPending) {
      await orderRef.update({
        paymentStatus:
          "pending",

        transactionStatus,

        updatedAt:
          new Date(),
      });

      console.log(
        "ORDER PENDING"
      );
    }

    // =========================
    // PAYMENT FAILED
    // =========================

    if (isFailed) {
      await orderRef.update({
        paymentStatus:
          "failed",

        transactionStatus,

        updatedAt:
          new Date(),
      });

      console.log(
        "ORDER FAILED"
      );
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
    message: "Midtrans webhook active",
  });
}