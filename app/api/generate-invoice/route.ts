import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "pdf-lib";

const bwipjs = require("bwip-js");

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
    const productText =
      `${item.name} x${item.quantity}`;

    // potong teks panjang
    const maxLength = 55;

    const lines: string[] = [];

    for (
      let i = 0;
      i < productText.length;
      i += maxLength
    ) {
      lines.push(
        productText.substring(
          i,
          i + maxLength
        )
      );
    }

    lines.forEach(
      (
        line,
        index
      ) => {
        page.drawText(line, {
          x: 50,
          y:
            y -
            index * 15,
          size: 12,
          font,
        });
      }
    );

    // harga di kanan
    page.drawText(
      `Rp ${(
        item.price *
        item.quantity
      ).toLocaleString()}`,
      {
        x: 470,
        y,
        size: 12,
        font,
      }
    );

    y -=
      lines.length * 15 +
      15;
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

    y -= 50;

// info pengirim
page.drawText(
  "Pengirim:",
  {
    x: 50,
    y,
    size: 14,
    font,
  }
);

y -= 20;

page.drawText(
  "KhairaShop25",
  {
    x: 50,
    y,
    size: 12,
    font,
  }
);

y -= 18;

page.drawText(
  "Citeureup, Bogor",
  {
    x: 50,
    y,
    size: 12,
    font,
  }
);

y -= 18;

page.drawText(
  "WA: 08xxxxxxxxxx",
  {
    x: 50,
    y,
    size: 12,
    font,
  }
);

y -= 60;

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
        x: 140,
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
        x: 210,
        y,
        size: 12,
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