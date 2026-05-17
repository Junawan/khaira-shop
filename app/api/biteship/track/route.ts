import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

import { resend } from "@/lib/resend";

import { sendWhatsApp } from "@/lib/fonnte";

export async function GET() {
  try {
    // AMBIL SEMUA ORDER SHIPPED
    const snapshot =
      await adminDb
        .collection("orders")
        .where(
          "orderStatus",
          "==",
          "shipped"
        )
        .get();

    for (const doc of snapshot.docs) {
      const order =
        doc.data();

      // SKIP JIKA TIDAK ADA RESI
      if (
        !order.trackingNumber
      ) {
        continue;
      }

      // CEK TRACKING BITESHIP
      const response =
        await fetch(
          `https://api.biteship.com/v1/trackings/${order.trackingNumber}`,
          {
            headers: {
              Authorization:
                process.env
                  .BITESHIP_API_KEY!,
            },
          }
        );

      const result =
        await response.json();

      console.log(result);

      const status =
        result?.status?.toLowerCase();

      // UPDATE STATUS FIRESTORE
      if (
        status ===
          "delivered"
      ) {
        await doc.ref.update({
          orderStatus:
            "delivered",

          deliveredAt:
            new Date(),

          shippingStatus:
            status,
        });

        // WHATSAPP
        await sendWhatsApp(
  order.phone,
  `Pesanan ${order.orderId} sedang dikirim`
);

        // EMAIL
        if (order.email) {
          await resend.emails.send({
            from:
              "Khaira Shop <onboarding@resend.dev>",

            to: order.email,

            subject:
              "Pesanan Sudah Diterima",

            html: `
              <div style="font-family:sans-serif">
                <h2>
                  Pesanan Delivered 🎉
                </h2>

                <p>
                  Halo ${order.customerName}
                </p>

                <p>
                  Pesanan kamu sudah diterima.
                </p>

                <p>
                  Terima kasih sudah berbelanja ❤️
                </p>

                <a
                  href="http://localhost:3000/review/${order.orderId}"
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
                  Beri Review
                </a>
              </div>
            `,
          });
        }

        console.log(
          "ORDER AUTO DELIVERED:",
          order.orderId
        );
      }

      // UPDATE STATUS LIVE
      if (
        status ===
          "in_transit" ||
        status ===
          "out_for_delivery"
      ) {
        await doc.ref.update({
          shippingStatus:
            status,
        });
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Tracking error",
      },
      {
        status: 500,
      }
    );
  }
}