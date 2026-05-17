import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

import { resend } from "@/lib/resend";

import { sendWhatsApp } from "@/lib/fonnte";

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

    const fraudStatus =
      body.fraud_status;

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

    // ORDER TIDAK DITEMUKAN
    if (snapshot.empty) {
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

    // PAYMENT SUCCESS
    const isPaid =
      transactionStatus ===
        "capture" ||
      transactionStatus ===
        "settlement";

    if (isPaid) {
      // FRAUD CHECK
      if (
        transactionStatus ===
          "capture" &&
        fraudStatus !==
          "accept"
      ) {
        return NextResponse.json({
          message:
            "Fraud detected",
        });
      }

      // CEGAH DUPLIKAT
      if (
        orderData.paymentStatus ===
        "paid"
      ) {
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

        paidAt: new Date(),
      });

      console.log(
        "ORDER UPDATED TO PAID"
      );

      // LINK TRACKING
      const trackingUrl = `http://localhost:3000/tracking/${orderData.orderId}`;

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

                to: orderData.email,

                subject:
                  "Pembayaran Berhasil",

                html: `
                <div style="font-family:sans-serif">

                  <h2>
                    Pembayaran Berhasil ✅
                  </h2>

                  <p>
                    Halo ${
                      orderData.customerName
                    },
                  </p>

                  <p>
                    Pesanan kamu berhasil dibayar.
                  </p>

                  <p>
                    <strong>
                      Order ID:
                    </strong>
                    ${
                      orderData.orderId
                    }
                  </p>

                  <p>
                    <strong>
                      Total:
                    </strong>
                    Rp${(
                      orderData.total || 0
                    ).toLocaleString()}
                  </p>

                  <a
                    href="${trackingUrl}"
                    style="
                      display:inline-block;
                      margin-top:20px;
                      background:black;
                      color:white;
                      padding:12px 20px;
                      text-decoration:none;
                      border-radius:10px;
                    "
                  >
                    Tracking Pesanan
                  </a>

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
          const waResult =
            await sendWhatsApp(
              orderData.phone,
              `Pembayaran berhasil ✅

Order:
${orderData.orderId}

Total:
Rp${(
                orderData.total || 0
              ).toLocaleString()}

Tracking:
${trackingUrl}`
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