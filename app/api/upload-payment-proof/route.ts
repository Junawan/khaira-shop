import { NextResponse } from "next/server";

import { adminDb, bucket } from "@/lib/firebase-admin";

import { sendWhatsApp } from "@/lib/fonnte";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    const orderId = formData.get("orderId") as string;

    if (!file || !orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "File atau Order ID tidak ditemukan",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const fileName =
      `payment-proofs/${orderId}-${Date.now()}-${file.name}`;

    const fileUpload =
      bucket.file(fileName);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    await fileUpload.makePublic();

    const imageUrl =
      `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    const snapshot =
      await adminDb
        .collection("orders")
        .where("orderId", "==", orderId)
        .limit(1)
        .get();

      if (snapshot.empty) {
  return NextResponse.json(
    {
      success: false,
      message: "Order tidak ditemukan",
    },
    {
      status: 404,
    }
  );
}

const order =
  snapshot.docs[0].data();


    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        paymentProofUrl: imageUrl,

        paymentProofStatus:
          "uploaded",

        updatedAt:
          new Date(),
      });
    }

    await sendWhatsApp(
  process.env.ADMIN_WHATSAPP!,
  `📸 Bukti pembayaran QRIS masuk

Order:
${order.orderId}

Customer:
${order.customerName}

Silakan cek dashboard admin untuk verifikasi pembayaran.`
);

    return NextResponse.json({
      success: true,

      imageUrl,
    });
    
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Upload bukti pembayaran gagal",
      },
      {
        status: 500,
      }
    );
  }
}