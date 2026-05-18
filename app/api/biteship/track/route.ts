import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

import { sendWhatsApp } from "@/lib/fonnte";

import { resend } from "@/lib/resend";

export const runtime = "nodejs";

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

      try {
        // TRACK BITESHIP
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

        console.log(
          "BITESHIP:",
          result
        );

        const status =
          result?.status?.toLowerCase() ||
          "";

        // =====================
        // UPDATE SHIPPING STATUS
        // =====================

        await doc.ref.update({
          shippingStatus:
            status,
        });

        // =====================
        // IN TRANSIT
        // =====================

        if (
          status ===
            "picked" ||
          status ===
            "in_transit" ||
          status ===
            "out_for_delivery"
        ) {
          // CEGAH SPAM
          if (
            order.lastShippingStatus ===
            status
          ) {
            continue;
          }

          await doc.ref.update({
            lastShippingStatus:
              status,
          });

          // WHATSAPP
          if (order.phone) {
            await sendWhatsApp(
              order.phone,
              `Paket kamu sedang dikirim 🚚

Order:
${order.orderId}

Status:
${status}

Tracking:
https://ks25.my.id/tracking/${order.orderId}`
            );
          }
        }

        // =====================
        // DELIVERED
        // =====================

        if (
          status ===
          "delivered"
        ) {
          // CEGAH DUPLIKAT
          if (
            order.orderStatus ===
            "delivered"
          ) {
            continue;
          }

          // UPDATE FIRESTORE
          await doc.ref.update({
            orderStatus:
              "delivered",

            deliveredAt:
              new Date(),

            shippingStatus:
              status,
          });

          // =====================
          // WHATSAPP
          // =====================

          if (order.phone) {
            await sendWhatsApp(
              order.phone,
              `Pesanan sudah diterima 🎉

Order:
${order.orderId}

Terima kasih sudah belanja di Khaira Shop ❤️`
            );
          }

          // =====================
          // EMAIL
          // =====================

          if (order.email) {
            await resend.emails.send({
              from:
                "Khaira Shop <noreply@ks25.my.id>",

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
                    href="https://ks25.my.id/review/${order.orderId}"
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
      } catch (trackingError) {
        console.log(
          "TRACKING ERROR:",
          trackingError
        );
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