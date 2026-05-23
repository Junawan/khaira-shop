import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("LOUVIN CALLBACK:", body);

    const data = body.data;

    if (!data?.order_id) {
      return NextResponse.json(
        { success: false, message: "Order ID kosong" },
        { status: 400 }
      );
    }

    // CARI ORDER
    const snapshot = await adminDb
      .collection("orders")
      .where("orderId", "==", data.order_id)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];

    // UPDATE ORDER
    await doc.ref.update({
      paymentStatus: data.status || "pending",

      paymentType: data.payment_type || "qris",

      louvinTransactionId:
        data.transaction_id || "",

      paidAmount: data.amount || 0,

      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log("LOUVIN CALLBACK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Callback gagal",
      },
      {
        status: 500,
      }
    );
  }
}