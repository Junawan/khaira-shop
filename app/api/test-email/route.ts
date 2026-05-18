import { NextResponse } from "next/server";

import { resend } from "@/lib/resend";

export async function GET() {
  try {
    const data =
      await resend.emails.send({
        from:
          "Khaira Shop <onboarding@resend.dev>",

        to: "EMAILKAMU@gmail.com",

        subject:
          "Test Email",

        html: `
          <h1>Email berhasil 🎉</h1>
        `,
      });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error,
      },
      {
        status: 500,
      }
    );
  }
}