import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "pdf-lib";

const bwipjs = require("bwip-js");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID kosong" },
        { status: 400 }
      );
    }

    const docSnap = await adminDb
      .collection("orders")
      .doc(orderId)
      .get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    const order = docSnap.data();

    const pdfDoc = await PDFDocument.create();

    // Ukuran A6 Portrait
    const page = pdfDoc.addPage([420, 595]);

    const font = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const fontBold = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    const width = page.getWidth();
    const height = page.getHeight();

    // Border luar
    page.drawRectangle({
      x: 5,
      y: 5,
      width: width - 10,
      height: height - 10,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    // ======================
    // HEADER
    // ======================

    page.drawText("J&T", {
      x: 20,
      y: 560,
      size: 18,
      font: fontBold,
      color: rgb(1, 0, 0),
    });

    page.drawText("KhairaShop25", {
      x: 150,
      y: 560,
      size: 20,
      font: fontBold,
    });

    page.drawLine({
      start: { x: 5, y: 540 },
      end: { x: width - 5, y: 540 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // ======================
    // BARCODE RESI BESAR
    // ======================

    const trackingNumber =
      order?.trackingNumber ||
      order?.orderId ||
      orderId;

    const barcodeBuffer =
      await bwipjs.toBuffer({
        bcid: "code128",
        text: trackingNumber,
        scale: 3,
        height: 12,
      });

    const barcodeImage =
      await pdfDoc.embedPng(
        barcodeBuffer
      );

    page.drawImage(barcodeImage, {
      x: 50,
      y: 450,
      width: 320,
      height: 70,
    });

    page.drawText(
      `Nomor Resi : ${trackingNumber}`,
      {
        x: 120,
        y: 430,
        size: 12,
        font: fontBold,
      }
    );

    page.drawLine({
      start: { x: 5, y: 410 },
      end: { x: width - 5, y: 410 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // ======================
    // INFO PENGIRIMAN
    // ======================

    page.drawText(
      `Ongkir : Rp ${(order?.shippingCost || 0).toLocaleString()}`,
      {
        x: 20,
        y: 390,
        size: 10,
        font,
      }
    );

    page.drawText(
      `Layanan : ${order?.courier || "J&T"} ${order?.service || "Reguler"}`,
      {
        x: 20,
        y: 375,
        size: 10,
        font,
      }
    );

    page.drawLine({
      start: { x: 5, y: 360 },
      end: { x: width - 5, y: 360 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // ======================
    // REFERENCE BARCODE
    // ======================

    const refBarcode =
      await bwipjs.toBuffer({
        bcid: "code128",
        text: order?.orderId || orderId,
        scale: 2,
        height: 8,
      });

    const refImage =
      await pdfDoc.embedPng(
        refBarcode
      );

    page.drawText(
      "Reference Number",
      {
        x: 15,
        y: 340,
        size: 9,
        font,
      }
    );

    page.drawImage(refImage, {
      x: 15,
      y: 285,
      width: 190,
      height: 45,
    });

    page.drawLine({
      start: { x: 210, y: 360 },
      end: { x: 210, y: 260 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      `Qty : ${order?.items?.length || 1}`,
      {
        x: 225,
        y: 330,
        size: 10,
        font,
      }
    );

    page.drawText(
      `Weight : ${order?.weight || 0.1} Kg`,
      {
        x: 225,
        y: 300,
        size: 10,
        font,
      }
    );

    page.drawLine({
      start: { x: 5, y: 260 },
      end: { x: width - 5, y: 260 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // ======================
    // PENERIMA
    // ======================

    page.drawText(
      "Alamat Penerima",
      {
        x: 15,
        y: 240,
        size: 10,
        font: fontBold,
      }
    );

    page.drawText(
      order?.customerName || "-",
      {
        x: 15,
        y: 225,
        size: 10,
        font,
      }
    );

    page.drawText(
      order?.phone || "-",
      {
        x: 15,
        y: 210,
        size: 10,
        font,
      }
    );

    const address =
      order?.address || "-";

    const maxLength = 35;

    let addressY = 195;

    for (
      let i = 0;
      i < address.length;
      i += maxLength
    ) {
      page.drawText(
        address.substring(
          i,
          i + maxLength
        ),
        {
          x: 15,
          y: addressY,
          size: 9,
          font,
        }
      );

      addressY -= 12;
    }

    // ======================
    // PENGIRIM
    // ======================

    page.drawLine({
      start: { x: 210, y: 260 },
      end: { x: 210, y: 120 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      "Alamat Pengirim",
      {
        x: 225,
        y: 240,
        size: 10,
        font: fontBold,
      }
    );

    page.drawText(
      "KhairaShop25",
      {
        x: 225,
        y: 225,
        size: 10,
        font,
      }
    );

    page.drawText(
      "08123456789",
      {
        x: 225,
        y: 210,
        size: 10,
        font,
      }
    );

    page.drawText(
      "Bogor, Jawa Barat",
      {
        x: 225,
        y: 195,
        size: 9,
        font,
      }
    );

    page.drawLine({
      start: { x: 5, y: 120 },
      end: { x: width - 5, y: 120 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // ======================
    // DETAIL BARANG
    // ======================

    page.drawText(
      "Jenis Barang",
      {
        x: 15,
        y: 100,
        size: 10,
        font: fontBold,
      }
    );

    const productText =
      order?.items
        ?.map(
          (i: any) =>
            `${i.quantity}x ${i.name}`
        )
        .join(", ") || "-";

    let productY = 85;

    for (
      let i = 0;
      i < productText.length;
      i += 60
    ) {
      page.drawText(
        productText.substring(
          i,
          i + 60
        ),
        {
          x: 15,
          y: productY,
          size: 8,
          font,
        }
      );

      productY -= 10;
    }

    page.drawText(
      "Pengiriman melalui platform www.ks25.my.id",
      {
        x: 90,
        y: 20,
        size: 8,
        font,
      }
    );

    const pdfBytes =
      await pdfDoc.save();

    return new Response(
      Buffer.from(pdfBytes),
      {
        headers: {
          "Content-Type":
            "application/pdf",
          "Content-Disposition":
            `inline; filename="label-${orderId}.pdf"`,
        },
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Generate label gagal",
      },
      {
        status: 500,
      }
    );
  }
}