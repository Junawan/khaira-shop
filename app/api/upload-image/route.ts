import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(
  req: Request
) {
  try {
    const formData =
      await req.formData();

    const file =
      formData.get(
        "file"
      ) as File;

    if (!file) {
      return NextResponse.json(
        {
          error:
            "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const base64 =
      `data:${file.type};base64,${buffer.toString(
        "base64"
      )}`;

    const result =
      await cloudinary.uploader.upload(
        base64,
        {
          folder:
            "khairashop",
        }
      );

    return NextResponse.json({
      success: true,

      url: result.secure_url,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}