import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://api.biteship.com/v1/rates/couriers",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          origin_postal_code: "16820",

          destination_postal_code:
            body.destination_postal_code,

          couriers:
            "jne,sicepat,jnt,anteraja,pos",

          items: body.items,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}