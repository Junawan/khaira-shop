import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

import axios from "axios";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "CHECKOUT BODY:",
      body
    );

    const orderId = `ORDER-${Date.now()}`;

    // =========================
    // TOTAL
    // =========================

    const subtotal = body.items.reduce(
      (
        acc: number,
        item: any
      ) =>
        acc +
        Number(item.price) *
          Number(
            item.quantity
          ),
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

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        });

    // =========================
    // NOTIF ADMIN
    // =========================

    const itemsText =
      body.items
        .map(
          (item: any) =>
            `• ${item.name}
Qty: ${
              item.quantity
            }
Rp${(
              item.price *
              item.quantity
            ).toLocaleString()}`
        )
        .join("\n\n");

    const adminMessage = `🛒 ORDER BARU MASUK

Order ID:
${orderId}

Nama:
${body.name}

WhatsApp:
${body.phone}

Alamat:
${body.address}

Produk:
${itemsText}

Subtotal:
Rp${subtotal.toLocaleString()}

Ongkir:
Rp${shippingCost.toLocaleString()}

Total:
Rp${total.toLocaleString()}

Kurir:
${body.courier} - ${
      body.courierService
    }
`;

    // =========================
    // SEND WA ADMIN
    // =========================

    try {
      await fetch(
        "https://api.fonnte.com/send",
        {
          method: "POST",

          headers: {
            Authorization:
              process.env
                .FONNTE_TOKEN ||
              "",
          },

          body:
            new URLSearchParams(
              {
                target:
                  process.env
                    .ADMIN_WHATSAPP ||
                  "",

                message:
                  adminMessage,
              }
            ),
        }
      );
    } catch (waError) {
      console.log(
        "FONNTE ERROR:",
        waError
      );
    }

    // =========================
    // CREATE LOUVIN QRIS
    // =========================

    const response =
      await axios.post(
        "https://api.louvin.dev/create-transaction",
        {
          slug:
            "khairashop25",

          payment_type:
            "qris",

          amount: total,

          reference:
            orderId,

          customer_name:
            body.name,

          customer_email:
            body.email,

          customer_phone:
            body.phone,

          items:
            body.items.map(
              (item: any) => ({
                name:
                  item.name,

                price:
                  Number(
                    item.price
                  ),

                quantity:
                  Number(
                    item.quantity
                  ),
              })
            ),

          success_url:
            "https://www.khairashop25.web.id/payment-success",

          failed_url:
            "https://www.khairashop25.web.id/payment-failed",
        },

        {
          headers: {
            "x-api-key":
              process.env
                .LOUVIN_API_KEY!,
          },
        }
      );

    console.log(
      "LOUVIN FULL RESPONSE:",
      JSON.stringify(
        response.data,
        null,
        2
      )
    );

    // =========================
    // VALIDASI QR STRING
    // =========================

    const qrString =
      response.data?.payment
        ?.qr_string;

    if (!qrString) {
      return NextResponse.json(
        {
          success: false,

          message:
            "QRIS tidak ditemukan",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // UPDATE ORDER
    // =========================

    await adminDb
      .collection("orders")
      .doc(orderRef.id)
      .update({
        louvinResponse:
          response.data,

        qrString,

        updatedAt:
          new Date(),
      });

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,

      qrString,

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
          error?.response?.data
            ?.error ||
          error?.message ||
          "Louvin Error",
      },
      {
        status: 500,
      }
    );
  }
}