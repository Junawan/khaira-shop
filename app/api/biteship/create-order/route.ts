import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = body.orderId;

    // AMBIL ORDER DARI FIRESTORE
    const orderDoc = await adminDb
      .collection("orders")
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        {
          error: "Order tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const order = orderDoc.data();

    // GENERATE RESI DUMMY
    // nanti diganti biteship asli
    const trackingNumber = `KHR${Date.now()}`;

    // SIMPAN KE FIRESTORE
    await orderDoc.ref.update({
      trackingNumber,

      orderStatus: "shipped",

      trackingHistory: [
        {
          status: "picked_up",

          note:
            "Paket telah dipickup kurir",

          updated_at:
            new Date().toLocaleString(
              "id-ID"
            ),
        },

        {
          status: "in_transit",

          note:
            "Paket sedang dikirim",

          updated_at:
            new Date().toLocaleString(
              "id-ID"
            ),
        },
      ],
    });

    return NextResponse.json({
      success: true,

      trackingNumber,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Gagal generate resi",
      },
      {
        status: 500,
      }
    );
  }
}