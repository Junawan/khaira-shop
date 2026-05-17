import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ambil body optional
    let body = null;

    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    console.log("BITESHIP WEBHOOK:", body);

    // WAJIB response cepat
    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
    },
    {
      status: 200,
    }
  );
}