import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("TRIPAY CALLBACK:", body);

    const reference =
      body.reference;

    const status =
      body.status;

    // cari order berdasarkan reference
    const snapshot =
      await adminDb
        .collection("orders")
        .where(
          "tripayReference",
          "==",
          reference
        )
        .get();

    if (!snapshot.empty) {
      const doc =
        snapshot.docs[0];

      await doc.ref.update({
        paymentStatus:
          status.toLowerCase(),

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