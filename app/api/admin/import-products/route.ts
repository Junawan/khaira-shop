import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function POST(req: Request) {
  try {
    const body =
      await req.json();

    const products =
      body.products || [];

    const groupedProducts:
      Record<string, any> = {};

    for (const item of products) {
      const key = item.name;

      if (
        !groupedProducts[key]
      ) {
        groupedProducts[key] = {
          name: item.name,

          slug: slugify(
            item.name
          ),

          type:
            item.type ||
            "single",

          category:
            item.category || "",

          description:
            item.description ||
            "",

          image:
            item.image || "",

          price:
            Number(
              item.price
            ) || 0,

          stock:
            Number(
              item.stock
            ) || 0,

          variants: [],
        };
      }

      if (
        item.type ===
        "variant"
      ) {
        groupedProducts[
          key
        ].variants.push({
          name:
            item.variantName,

          value:
            item.variantValue,

          price:
            Number(
              item.price
            ) || 0,

          stock:
            Number(
              item.stock
            ) || 0,
        });
      }
    }

    const finalProducts =
      Object.values(
        groupedProducts
      );

    for (const product of finalProducts) {
      await adminDb
        .collection("products")
        .add({
          ...product,

          createdAt:
            new Date(),
        });
    }

    return NextResponse.json({
      success: true,

      total:
        finalProducts.length,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Import gagal",
      },
      {
        status: 500,
      }
    );
  }
}