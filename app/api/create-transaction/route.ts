import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import axios from "axios";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const merchantCode =
      process.env.TRIPAY_MERCHANT_CODE!;

    const apiKey =
      process.env.TRIPAY_API_KEY!;

    const privateKey =
      process.env.TRIPAY_PRIVATE_KEY!;

    const isProduction =
      process.env.TRIPAY_IS_PRODUCTION ===
      "true";

    const baseUrl = isProduction
      ? "https://tripay.co.id/api"
      : "https://tripay.co.id/api-sandbox";

    // =====================
    // ORDER
    // =====================

    const orderId = `ORDER-${Date.now()}`;

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

    // =====================
    // SAVE FIRESTORE
    // =====================

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
            body.courierService || "",

          paymentStatus:
            "pending",

          orderStatus:
            "pending",

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        });

    // =====================
    // SIGNATURE
    // =====================

    const signature = crypto
      .createHmac(
        "sha256",
        privateKey
      )
      .update(
        merchantCode +
          orderId +
          total
      )
      .digest("hex");

    // =====================
    // REQUEST
    // =====================

    const payload = {
      method: "QRIS",

      merchant_ref: orderId,

      amount: total,

      customer_name: body.name,

      customer_email:
        body.email,

      customer_phone:
        body.phone,

      order_items: [
        ...body.items.map(
          (item: any) => ({
            sku:
              item.id ||
              "product",

            name: item.name,

            price: Number(
              item.price
            ),

            quantity: Number(
              item.quantity
            ),
          })
        ),

        {
          sku: "shipping",

          name:
            "Ongkos Kirim",

          price:
            shippingCost,

          quantity: 1,
        },
      ],

      return_url:
        "https://ks25.my.id/payment-success",

      expired_time:
        Math.floor(
          Date.now() / 1000
        ) +
        24 * 60 * 60,

      signature,
    };

    const response =
      await axios.post(
        `${baseUrl}/transaction/create`,
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${apiKey}`,
          },
        }
      );

    return NextResponse.json({
      success: true,

      paymentUrl:
        response.data.data
          .checkout_url,

      reference:
        response.data.data
          .reference,

      orderId,

      firestoreDocId:
        orderRef.id,
    });
  } catch (error: any) {
    console.log(
      "TRIPAY ERROR:",
      error.response?.data ||
        error.message
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.response?.data ||
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}