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
    const body = await req.json();

    const products =
      body.products || [];

    const groupedProducts: Record<
      string,
      any
    > = {};

    for (const item of products) {
      const key = item.name;

      // BUAT PRODUCT PERTAMA
      if (!groupedProducts[key]) {
        groupedProducts[key] = {
          name: item.name || "",

          slug: slugify(
            item.name || ""
          ),

          type:
            item.type || "single",

          category:
            item.category || "",

          description:
            item.description || "",

          image:
            item.image1 || "",

          images: [
            item.image1,
            item.image2,
            item.image3,
            item.image4,
          ].filter(Boolean),

          price:
            Number(item.price) || 0,

          stock:
            Number(item.stock) || 0,

          weight:
            Number(item.weight) || 0,

          length:
            Number(
              item.packageLength
            ) || 0,

          width:
            Number(
              item.packageWidth
            ) || 0,

          height:
            Number(
              item.packageHeight
            ) || 0,

          variants: [],
        };
      }

      // HANDLE VARIANT
      if (item.type === "variant") {
        const existingVariant =
          groupedProducts[
            key
          ].variants.find(
            (v: any) =>
              v.name ===
              item.variantName
          );

        const valueData = {
          value:
            item.variantValue || "",

          price:
            Number(item.price) || 0,

          stock:
            Number(item.stock) || 0,
        };

        // JIKA VARIANT SUDAH ADA
        if (existingVariant) {
          existingVariant.values.push(
            valueData
          );
        } else {
          // BUAT VARIANT BARU
          groupedProducts[
            key
          ].variants.push({
            name:
              item.variantName || "",

            values: [valueData],
          });
        }
      }
    }

    const finalProducts =
      Object.values(
        groupedProducts
      );

    // SIMPAN KE FIRESTORE
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