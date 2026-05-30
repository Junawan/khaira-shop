import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    const {
      type,
      docId,
      orderId,
      customerName,
      phone,
      address,
      postalCode,
      courier,
      courierService,
      items,
    } = body;

    // =========================
    // NORMALIZE COURIER
    // =========================

    const courierCompany = courier
      .toLowerCase()
      .replace(/\s/g, "")
      .replace("&", "");

    const courierType = courierService
      .toLowerCase()
      .replace(/\s/g, "");

    // =========================
    // AUTO FIX J&T
    // =========================

    let finalCourier = courierCompany;

    if (
      courierCompany === "jt" ||
      courierCompany === "j&t"
    ) {
      finalCourier = "jnt";
    }

    // =========================
    // PICKUP SUPPORT
    // =========================

    const pickupSupported = [
      "jne",
      "sicepat",
      "anteraja",
      "grab",
      "gosend",
    ];

    const isPickupSupported =
      pickupSupported.includes(finalCourier);

    // =========================
    // AUTO FALLBACK
    // =========================

    let finalType = type;

    if (
      type === "pickup" &&
      !isPickupSupported
    ) {
      finalType = "dropoff";
    }

    // =========================
    // PAYLOAD
    // =========================

    const payload: any = {
      order_id: orderId,

      delivery_type: "now",

      courier_company: finalCourier,

      courier_type: courierType,

      origin_contact_name: "Khaira Shop",

      origin_contact_phone: "08123456789",

      origin_address: "Bogor Jawa Barat",

      origin_postal_code: "16810",

      destination_contact_name:
        customerName,

      destination_contact_phone:
        phone,

      destination_address: address,

      destination_postal_code:
        postalCode,

      items: items.map((item: any) => ({
        name: item.name,

        description: item.name,

        value: item.price,

        quantity: item.quantity,

        weight:
          item.weight * item.quantity,
      })),

      origin_collection_method:
        finalType === "pickup"
          ? "pickup"
          : "dropoff",
    };

    console.log(
      "FINAL PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    // =========================
    // CALL BITESHIP
    // =========================

    const biteshipResponse =
      await fetch(
        "https://api.biteship.com/v1/orders",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

    const result =
      await biteshipResponse.json();

    console.log(
      "BITESHIP STATUS:",
      biteshipResponse.status
    );

    console.log(
      "BITESHIP RESULT:",
      JSON.stringify(result, null, 2)
    );

    console.log(
  "BITESHIP KEY:",
  process.env.BITESHIP_API_KEY
);

    if (!biteshipResponse.ok) {
      return NextResponse.json(
        {
          success: false,

          error:
            result?.error ||
            result?.message ||
            "Gagal membuat resi",

          detail: result,
        },
        { status: 400 }
      );
    }

    // =========================
    // GET RESI
    // =========================

    const waybill =
      result?.courier?.waybill_id || "";

    const trackingId =
      result?.courier?.tracking_id || "";

    const trackingLink =
      result?.courier?.link || "";

    // =========================
    // UPDATE FIRESTORE
    // =========================

    await adminDb
      .collection("orders")
      .doc(docId)
      .update({
        airwayBillId: waybill,

        trackingId,

        trackingLink,

        shippingType: finalType,

        biteshipOrderId:
          result?.id || "",

        updatedAt: new Date(),
      });

    console.log("FIRESTORE UPDATED");

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,

      airwayBillId: waybill,

      trackingId,

      trackingLink,

      shippingType: finalType,
    });
  } catch (error: any) {
    console.error(
      "BITESHIP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Internal Server Error",
      },
      { status: 500 }
    );
  }
}