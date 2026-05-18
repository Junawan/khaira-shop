import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot =
      await adminDb
        .collection("orders")
        .where(
          "trackingNumber",
          "!=",
          null
        )
        .get();

    for (const doc of snapshot.docs) {
      const order = doc.data();

      if (!order.trackingNumber)
        continue;

      const response =
        await fetch(
          `https://api.biteship.com/v1/trackings/${order.trackingNumber}`,
          {
            headers: {
              Authorization:
                process.env.BITESHIP_API_KEY!,
            },
          }
        );

      const result =
        await response.json();

      const history =
        result.history || [];

      const latest =
        history[0];

      await doc.ref.update({
        trackingHistory:
          history,

        lastTrackingStatus:
          latest?.status ||
          null,
      });

      // AUTO DELIVERED
      if (
        latest?.status ===
        "delivered"
      ) {
        await doc.ref.update({
          orderStatus:
            "delivered",
        });
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