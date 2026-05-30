import { NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/fonnte";

export async function GET() {
  const result =
    await sendWhatsApp(
      "6285710255464",
      "TEST WA DARI WEBSITE"
    );

  return NextResponse.json(result);
}