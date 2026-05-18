import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK TEST:", body);

    return NextResponse.json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Webhook error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook active",
  });
}