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

    console.log({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const mimeType =
      file.type ||
      "image/jpeg";

    const base64 =
      `data:${mimeType};base64,${buffer.toString(
        "base64"
      )}`;

    const result =
      await cloudinary.uploader.upload(
        base64,
        {
          folder:
            "khairashop",

          resource_type:
            "image",
        }
      );

    return NextResponse.json({
      success: true,

      url: result.secure_url,
    });
  } catch (error: any) {
    console.error(
      "UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}