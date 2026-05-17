import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

import { resend } from "@/lib/resend";

import { sendWhatsApp } from "@/lib/fonnte";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const {
      orderId,
      status,
      trackingNumber,
    } = body;

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

    // UPDATE STATUS
    await orderRef.update({
      orderStatus: status,

      trackingNumber:
        trackingNumber || "",

      updatedAt:
        new Date(),
    });

    const trackingUrl = `http://localhost:3000/tracking/${orderData.orderId}`;

    // ======================
    // STATUS SHIPPED
    // ======================

    if (status === "shipped") {
      // EMAIL
      if (orderData.email) {
        try {
          await resend.emails.send({
            from:
              "Khaira Shop <onboarding@resend.dev>",

            to: orderData.email,

            subject:
              "Pesanan Dikirim",

            html: `
              <div style="font-family:sans-serif">

                <h2>
                  Pesanan Dikirim 🚚
                </h2>

                <p>
                  Halo ${
                    orderData.customerName
                  }
                </p>

                <p>
                  Pesanan kamu sedang dikirim.
                </p>

                <p>
                  Resi:
                  <strong>
                    ${trackingNumber}
                  </strong>
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
          });
        } catch (error) {
          console.log(
            "EMAIL ERROR:",
            error
          );
        }
      }

      // WHATSAPP
      if (orderData.phone) {
        try {
          await sendWhatsApp(
            orderData.phone,
            `Pesanan dikirim 🚚

Order:
${orderData.orderId}

Resi:
${trackingNumber}

Tracking:
${trackingUrl}`
          );
        } catch (error) {
          console.log(
            "WA ERROR:",
            error
          );
        }
      }
    }

    // ======================
    // STATUS DELIVERED
    // ======================

    if (status === "delivered") {
      if (orderData.phone) {
        await sendWhatsApp(
          orderData.phone,
          `Pesanan selesai ✅

Order:
${orderData.orderId}

Terima kasih sudah berbelanja ❤️`
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
          "Update status gagal",
      },
      {
        status: 500,
      }
    );
  }
}