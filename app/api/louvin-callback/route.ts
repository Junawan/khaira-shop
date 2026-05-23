import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "LOUVIN CALLBACK:",
      body
    );

    const orderId =
      body.external_id;

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
          "paid",

        orderStatus:
          "processing",

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