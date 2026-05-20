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
  // FLEXIBLE HEADER
  const productName =
    item.name ||
    item.Name ||
    item.nama ||
    item.Nama ||
    "";

  if (!productName) continue;

  const productType = (
    item.type ||
    item.Type ||
    "single"
  )
    .toString()
    .toLowerCase();

  const key = productName.trim();

  // CREATE PRODUCT
  if (!groupedProducts[key]) {
    groupedProducts[key] = {
      name: key,

      slug: slugify(key),

      type: productType,

      category:
        item.category ||
        item.Category ||
        "",

      description:
        item.description ||
        item.Description ||
        "",

      image:
        item.image1 ||
        item.Image1 ||
        "",

      images: [
        item.image1 ||
          item.Image1,

        item.image2 ||
          item.Image2,

        item.image3 ||
          item.Image3,

        item.image4 ||
          item.Image4,
      ].filter(Boolean),

      // SINGLE PRODUCT PRICE
      price:
        productType === "single"
          ? Number(item.price || item.Price) ||
            0
          : 0,

      stock:
        Number(item.stock || item.Stock) ||
        0,

      weight:
        Number(
          item.weight ||
            item.Weight
        ) || 0,

      length:
        Number(
          item.packageLength ||
            item.PackageLength
        ) || 0,

      width:
        Number(
          item.packageWidth ||
            item.PackageWidth
        ) || 0,

      height:
        Number(
          item.packageHeight ||
            item.PackageHeight
        ) || 0,

      variants: [],
    };
  }

  // VARIANT PRODUCT
  if (productType === "variant") {
    const variantName =
      item.variantName ||
      item.VariantName ||
      "Varian";

    const variantValue =
      item.variantValue ||
      item.VariantValue ||
      "";

    // cek group variant
    let existingVariant =
      groupedProducts[
        key
      ].variants.find(
        (v: any) =>
          v.name === variantName
      );

    // buat group jika belum ada
    if (!existingVariant) {
      existingVariant = {
        name: variantName,
        values: [],
      };

      groupedProducts[
        key
      ].variants.push(
        existingVariant
      );
    }

    // push value
    existingVariant.values.push({
      value: variantValue,

      price:
        Number(
          item.price ||
            item.Price
        ) || 0,

      stock:
        Number(
          item.stock ||
            item.Stock
        ) || 0,
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