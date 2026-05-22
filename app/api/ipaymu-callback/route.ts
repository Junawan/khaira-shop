import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "IPAYMU CALLBACK:",
      body
    );

    const orderId =
      body.reference_id;

    const status =
      body.status;

    const snapshot =
      await adminDb
        .collection("orders")
        .where(
          "orderId",
          "==",
          orderId
        )
        .get();

    if (!snapshot.empty) {
      const doc =
        snapshot.docs[0];

      await doc.ref.update({
        paymentStatus:
          status === "berhasil"
            ? "paid"
            : "pending",

        updatedAt:
          new Date(),
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}