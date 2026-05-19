import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "pdf-lib";

import bwipjs from "bwip-js";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const orderId =
      searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        {
          error:
            "Order ID kosong",
        },
        {
          status: 400,
        }
      );
    }

    const docSnap =
      await adminDb
        .collection("orders")
        .doc(orderId)
        .get();

    if (!docSnap.exists) {
      return NextResponse.json(
        {
          error:
            "Order tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const order =
      docSnap.data();

    const pdfDoc =
      await PDFDocument.create();

    const page =
      pdfDoc.addPage([
        595,
        842,
      ]);

    const font =
      await pdfDoc.embedFont(
        StandardFonts.Helvetica
      );

    let y = 800;

    page.drawText(
      "INVOICE",
      {
        x: 230,
        y,
        size: 24,
        font,
      }
    );

    y -= 40;

    page.drawText(
      `Order ID: ${order?.orderId}`,
      {
        x: 50,
        y,
        size: 12,
        font,
      }
    );

    y -= 20;

    page.drawText(
      `Customer: ${order?.customerName}`,
      {
        x: 50,
        y,
        size: 12,
        font,
      }
    );

    y -= 20;

    page.drawText(
      `Phone: ${order?.phone}`,
      {
        x: 50,
        y,
        size: 12,
        font,
      }
    );

    y -= 20;

    page.drawText(
      `Address: ${order?.address}`,
      {
        x: 50,
        y,
        size: 12,
        font,
      }
    );

    y -= 40;

    page.drawText(
      "Produk:",
      {
        x: 50,
        y,
        size: 16,
        font,
      }
    );

    y -= 30;

    order?.items?.forEach(
      (item: any) => {
        page.drawText(
          `${item.name} x${item.quantity}`,
          {
            x: 50,
            y,
            size: 12,
            font,
          }
        );

        page.drawText(
          `Rp ${(
            item.price *
            item.quantity
          ).toLocaleString()}`,
          {
            x: 400,
            y,
            size: 12,
            font,
          }
        );

        y -= 20;
      }
    );

    y -= 30;

    page.drawText(
      `Total: Rp ${(
        order?.total || 0
      ).toLocaleString()}`,
      {
        x: 350,
        y,
        size: 16,
        font,
        color: rgb(
          0,
          0.5,
          0
        ),
      }
    );

    y -= 80;

    const barcodeBuffer =
      await bwipjs.toBuffer({
        bcid: "code128",
        text:
          order?.trackingNumber ||
          order?.orderId,
        scale: 3,
        height: 10,
      });

    const barcodeImage =
      await pdfDoc.embedPng(
        barcodeBuffer
      );

    page.drawImage(
      barcodeImage,
      {
        x: 150,
        y,
        width: 300,
        height: 80,
      }
    );

    y -= 30;

    page.drawText(
      order?.trackingNumber ||
        order?.orderId,
      {
        x: 220,
        y,
        size: 12,
        font,
      }
    );

    const pdfBytes =
      await pdfDoc.save();

    return new Response(
      pdfBytes,
      {
        headers: {
          "Content-Type":
            "application/pdf",
        },
      }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Generate PDF gagal",
      },
      {
        status: 500,
      }
    );
  }
}