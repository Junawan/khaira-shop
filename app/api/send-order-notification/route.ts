import { NextResponse } from "next/server";

import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    // ======================
    // WHATSAPP FONNTE
    // ======================

    await fetch(
      "https://api.fonnte.com/send",
      {
        method: "POST",

        headers: {
          Authorization:
            process.env.FONNTE_TOKEN!,
        },

        body: new URLSearchParams({
          target: body.phone,

          message: `
Halo ${body.customerName}

Pesanan kamu sedang diproses.

Order ID:
${body.orderId}

Status:
${body.status}

Resi:
${body.trackingNumber || "-"}

Terima kasih sudah berbelanja 🙏
          `,
        }),
      }
    );

    // ======================
    // EMAIL
    // ======================

    if (body.email) {
      await resend.emails.send({
        from:
          "Toko <onboarding@resend.dev>",

        to: body.email,

        subject:
          `Update Pesanan ${body.orderId}`,

        html: `
          <h2>Update Pesanan</h2>

          <p>Halo ${body.customerName}</p>

          <p>Status terbaru:</p>

          <b>${body.status}</b>

          <p>Resi:</p>

          <b>
            ${
              body.trackingNumber ||
              "-"
            }
          </b>
        `,
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Notification Error",
      },
      {
        status: 500,
      }
    );
  }
}