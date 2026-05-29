import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

import { sendWhatsApp } from "@/lib/fonnte";

import { resend } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      docId,
      status,
      trackingNumber,
    } = body;

    if (!docId || !status) {
      return NextResponse.json(
        {
          error: "Missing data",
        },
        {
          status: 400,
        }
      );
    }

    const orderRef =
      adminDb
        .collection("orders")
        .doc(docId);

    const snapshot =
      await orderRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const order =
      snapshot.data();

    if (!order) {
      return NextResponse.json(
        {
          error: "Order empty",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
// VERIFIKASI PEMBAYARAN QRIS
// =========================

if (status === "paid") {
  await orderRef.update({
    paymentStatus: "paid",

    paymentProofStatus:
      "verified",

    updatedAt: new Date(),
  });

  return NextResponse.json({
    success: true,
  });
}

// =========================
// UPDATE STATUS ORDER
// =========================

await orderRef.update({
  orderStatus: status,

  trackingNumber:
    trackingNumber ||
    order.trackingNumber ||
    "",

  updatedAt: new Date(),
});

    const trackingUrl = `https://www.khairashop25.web.id/tracking/${order.orderId}`;

    if (status === "paid") {
  if (order.phone) {
    await sendWhatsApp(
      order.phone,
      `✅ Pembayaran berhasil diverifikasi

Order:
${order.orderId}

Pesanan akan segera diproses.`
    );
  }
}

    // =========================
    // STATUS: PACKED
    // =========================

    if (status === "packed") {
      // WHATSAPP
      if (order.phone) {
        await sendWhatsApp(
          order.phone,
          `Pesanan kamu sedang diproses 📦

Order:
${order.orderId}

Toko sedang menyiapkan paket kamu ❤️`
        );
      }

      // EMAIL
      if (order.email) {
        await resend.emails.send({
          from:
            "Khaira Shop <noreply@www.khairashop25.web.id>",

          to: order.email,

          subject:
            "Pesanan Sedang Diproses",

          html: `
            <div style="font-family:sans-serif">
              <h2>
                Pesanan Diproses 📦
              </h2>

              <p>
                Halo ${order.customerName},
              </p>

              <p>
                Pesanan kamu sedang kami siapkan.
              </p>

              <p>
                Order ID:
                <strong>
                  ${order.orderId}
                </strong>
              </p>
            </div>
          `,
        });
      }
    }

    // =========================
    // STATUS: SHIPPED
    // =========================

    if (status === "shipped") {
      // WHATSAPP
      if (order.phone) {
        await sendWhatsApp(
          order.phone,
          `Pesanan kamu sudah dikirim 🚚

Order:
${order.orderId}

Resi:
${trackingNumber || "-"}

Tracking:
${trackingUrl}`
        );
      }

      // EMAIL
      if (order.email) {
        await resend.emails.send({
          from:
            "Khaira Shop <noreply@www.khairashop25.web.id>",

          to: order.email,

          subject:
            "Pesanan Sudah Dikirim",

          html: `
            <div style="font-family:sans-serif">
              <h2>
                Pesanan Dikirim 🚚
              </h2>

              <p>
                Halo ${order.customerName},
              </p>

              <p>
                Pesanan kamu sudah dikirim.
              </p>

              <p>
                <strong>
                  Resi:
                </strong>
                ${trackingNumber || "-"}
              </p>

              <a
                href="${trackingUrl}"
                style="
                  display:inline-block;
                  margin-top:20px;
                  background:black;
                  color:white;
                  padding:12px 20px;
                  border-radius:10px;
                  text-decoration:none;
                "
              >
                Tracking Pesanan
              </a>
            </div>
          `,
        });
      }
    }

    // =========================
    // STATUS: DELIVERED
    // =========================

    if (status === "delivered") {
      // WHATSAPP
      if (order.phone) {
        await sendWhatsApp(
          order.phone,
          `Pesanan sudah diterima 🎉

Order:
${order.orderId}

Terima kasih sudah belanja di Khaira Shop ❤️`
        );
      }

      // EMAIL
      if (order.email) {
        await resend.emails.send({
          from:
            "Khaira Shop <noreply@www.khairashop25.web.id>",

          to: order.email,

          subject:
            "Pesanan Sudah Diterima",

          html: `
            <div style="font-family:sans-serif">
              <h2>
                Pesanan Diterima 🎉
              </h2>

              <p>
                Halo ${order.customerName},
              </p>

              <p>
                Pesanan kamu sudah diterima.
              </p>

              <p>
                Terima kasih sudah berbelanja ❤️
              </p>
            </div>
          `,
        });
      }
    }

    if (order.phone) {
  await sendWhatsApp(
    order.phone,
    `Pembayaran berhasil diverifikasi ✅

Order:
${order.orderId}

Pesanan akan segera diproses oleh tim kami.`
  );
}

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(
      "UPDATE STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Update status error",
      },
      {
        status: 500,
      }
    );
  }
}