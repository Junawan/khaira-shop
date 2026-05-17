import { NextResponse } from "next/server";

import adminDb from "@/lib/firebase-admin";

const PDFDocument = require("pdfkit");

const bwipjs = require("bwip-js");

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const orderId =
      body.orderId;

    const docSnap =
      await adminDb
        .collection("orders")
        .doc(orderId)
        .get();

    if (!docSnap.exists) {
      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    const order =
      docSnap.data();

    const pdf =
      new PDFDocument({
        margin: 40,
      });

    const chunks: Uint8Array[] =
      [];

    pdf.on(
      "data",
      (chunk: Buffer) =>
  chunks.push(chunk)
    );

    const barcode =
      await bwipjs.toBuffer({
        bcid: "code128",

        text:
          order?.trackingNumber ||
          order?.orderId,

        scale: 3,

        height: 10,
      });

    // HEADER

    pdf
      .fontSize(24)
      .text(
        "INVOICE",
        {
          align: "center",
        }
      );

    pdf.moveDown();

    pdf
      .fontSize(14)
      .text(
        `Order ID: ${order?.orderId}`
      );

    pdf.text(
      `Customer: ${order?.customerName}`
    );

    pdf.text(
      `Phone: ${order?.phone}`
    );

    pdf.text(
      `Address: ${order?.address}`
    );

    pdf.moveDown();

    // ITEMS

    pdf
      .fontSize(18)
      .text("Produk");

    pdf.moveDown(0.5);

    order?.items?.forEach(
      (item: any) => {
        pdf
          .fontSize(12)
          .text(
            `${item.name} x${item.quantity}`
          );

        pdf.text(
          `Rp ${(
            item.price *
            item.quantity
          ).toLocaleString()}`
        );

        pdf.moveDown(
          0.5
        );
      }
    );

    pdf.moveDown();

    pdf
      .fontSize(16)
      .text(
        `Total: Rp ${(
          order?.total || 0
        ).toLocaleString()}`,
        {
          align: "right",
        }
      );

    pdf.moveDown(2);

    // BARCODE

    pdf.image(barcode, {
      fit: [250, 80],

      align: "center",
    });

    pdf.moveDown();

    pdf
      .fontSize(12)
      .text(
        order?.trackingNumber ||
          order?.orderId,
        {
          align: "center",
        }
      );

    pdf.end();

    const pdfBuffer =
      await new Promise<Buffer>(
        (resolve) => {
          pdf.on(
            "end",
            () => {
              resolve(
                Buffer.concat(
                  chunks
                )
              );
            }
          );
        }
      );

    return new Response(
      pdfBuffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename=invoice-${order?.orderId}.pdf`,
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