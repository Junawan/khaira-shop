import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

import PDFDocument from "pdfkit";

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

    const order =
      docSnap.data();

    const pdf = new PDFDocument({
  margin: 40,
  font:
    process.cwd() +
    "/public/fonts/Arial.ttf",
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
          order?.airwayBillId ||
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

pdf.moveDown(0.5);

pdf
  .fontSize(16)
  .text("PENGIRIM", {
    underline: true,
  });

pdf.text(
  "Khaira Shop"
);

pdf.text(
  "Bogor, Jawa Barat"
);

pdf.text(
  "WA: 0857-1025-5464"
);

pdf.moveDown();

pdf
  .fontSize(16)
  .text("PENERIMA", {
    underline: true,
  });

pdf.text(
  `Nama: ${order?.customerName}`
);

pdf.text(
  `Phone: ${order?.phone}`
);

pdf.text(
  `Alamat: ${order?.address}`
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
        order?.airwayBillId ||
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
  new Uint8Array(pdfBuffer),
  {
    headers: {
  "Content-Type":
    "application/pdf",

  "Content-Disposition":
    `inline; filename=invoice-${orderId}.pdf`,
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