import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

import axios from "axios";

import CryptoJS from "crypto-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("CHECKOUT BODY:", body);

    // =========================
    // ORDER ID
    // =========================

    const orderId = `ORDER-${Date.now()}`;

    // =========================
    // TOTAL
    // =========================

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

    // =========================
    // SAVE FIRESTORE
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
    // IPAYMU
    // =========================

    const va =
      process.env.IPAYMU_VA || "";

    const apiKey =
      process.env.IPAYMU_API_KEY ||
      "";

    const method = "POST";

    const url =
      "https://my.ipaymu.com/api/v2/payment";

    // =========================
    // PRODUCT DATA
    // =========================

    const product = body.items.map(
      (item: any) => item.name
    );

    const qty = body.items.map(
      (item: any) =>
        Number(item.quantity)
    );

    const price = body.items.map(
      (item: any) =>
        Math.round(item.price)
    );

    // ongkir
    if (shippingCost > 0) {
      product.push(
        "Ongkos Kirim"
      );

      qty.push(1);

      price.push(
        Math.round(
          shippingCost
        )
      );
    }

    // =========================
    // BODY
    // =========================

    const bodyData = {
      product,

      qty,

      price,

      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,

      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,

      notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ipaymu-callback`,

      referenceId: orderId,

      buyerName: body.name,

      buyerPhone: body.phone,

      buyerEmail: body.email,
    };

    // =========================
    // SIGNATURE
    // =========================

    const bodyEncrypt =
      JSON.stringify(bodyData);

    const signatureString = CryptoJS.enc.Hex.stringify(
      CryptoJS.SHA256(
        bodyEncrypt
      )
    );

    const signature = CryptoJS.enc.Hex.stringify(
      CryptoJS.HmacSHA256(
        `${method}:${va}:${signatureString}:${apiKey}`,
        apiKey
      )
    );

    // =========================
    // REQUEST
    // =========================

    const response =
      await axios.post(
        url,
        bodyData,
        {
          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            va,

            signature,

            timestamp:
              new Date().toISOString(),
          },
        }
      );

    console.log(
      "IPAYMU RESPONSE:",
      response.data
    );

    // =========================
    // RETURN
    // =========================

    return NextResponse.json({
      success: true,

      redirect_url:
        response.data.Data.Url,

      orderId,

      firestoreDocId:
        orderRef.id,
    });
  } catch (error: any) {
    console.log(
      "IPAYMU ERROR:",
      error?.response?.data ||
        error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.response?.data ||
          "iPaymu error",
      },
      {
        status: 500,
      }
    );
  }
}