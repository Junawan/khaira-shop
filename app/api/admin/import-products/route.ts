import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function slugify(text: string) {
  return text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const products = body.products || [];

    if (!products.length) {
      return NextResponse.json(
        {
          error: "Data excel kosong",
        },
        {
          status: 400,
        }
      );
    }

    const groupedProducts: Record<string, any> =
      {};

    for (const item of products) {
      // ambil nama dengan aman
      const productName =
        item.name ||
        item.Nama ||
        item.nama ||
        "";

      // skip jika nama kosong
      if (!productName) continue;

      const key = productName.trim();

      // buat produk pertama
      if (!groupedProducts[key]) {
        groupedProducts[key] = {
          name: key,

          slug: slugify(key),

          type:
            item.type ||
            item.Type ||
            "single",

          category:
            item.category ||
            item.Category ||
            "",

          description:
            item.description ||
            item.Description ||
            "",

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

      // VARIANT
      if (
        (item.type || "").toLowerCase() ===
        "variant"
      ) {
        const variantName =
          item.variantName || "Varian";

        const existingVariant =
          groupedProducts[
            key
          ].variants.find(
            (v: any) =>
              v.name === variantName
          );

        // jika belum ada group variant
        if (!existingVariant) {
          groupedProducts[
            key
          ].variants.push({
            name: variantName,

            values: [],
          });
        }

        // cari lagi setelah dibuat
        const variantGroup =
          groupedProducts[
            key
          ].variants.find(
            (v: any) =>
              v.name === variantName
          );

        variantGroup.values.push({
          value:
            item.variantValue || "",

          price:
            Number(item.price) || 0,

          stock:
            Number(item.stock) || 0,
        });
      }
    }

    const finalProducts =
      Object.values(groupedProducts);

    for (const product of finalProducts) {
      await adminDb
        .collection("products")
        .add({
          ...product,

          createdAt: new Date(),

          updatedAt: new Date(),

          active: true,

          featured: false,
        });
    }

    return NextResponse.json({
      success: true,

      total: finalProducts.length,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Import gagal",
      },
      {
        status: 500,
      }
    );
  }
}