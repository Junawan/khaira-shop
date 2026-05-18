import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot =
      await adminDb
        .collection("orders")
        .get();

    const orders = snapshot.docs.map(
      (doc) => doc.data()
    );

    const paidOrders =
      orders.filter(
        (o) =>
          o.paymentStatus === "paid"
      );

    const revenue =
      paidOrders.reduce(
        (acc, order) =>
          acc + (order.total || 0),
        0
      );

    const totalOrders =
      paidOrders.length;

    const averageOrderValue =
      totalOrders > 0
        ? revenue / totalOrders
        : 0;

    // BEST SELLER
    const productMap:
      Record<string, number> = {};

    paidOrders.forEach((order) => {
      order.items?.forEach(
        (item: any) => {
          if (!productMap[item.name]) {
            productMap[item.name] = 0;
          }

          productMap[item.name] +=
            item.quantity;
        }
      );
    });

    const bestSeller =
      Object.entries(productMap)
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 5);

    // REPEAT CUSTOMER
    const customerMap:
      Record<string, number> = {};

    paidOrders.forEach((order) => {
      if (!customerMap[order.phone]) {
        customerMap[order.phone] = 0;
      }

      customerMap[order.phone]++;
    });

    const repeatCustomers =
      Object.values(customerMap)
        .filter((v) => v > 1)
        .length;

    // AI PREDICTION SIMPLE
    const predictedRevenue =
      revenue * 1.2;

    return NextResponse.json({
      revenue,

      totalOrders,

      averageOrderValue,

      repeatCustomers,

      predictedRevenue,

      bestSeller,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error:
          "Analytics error",
      },
      {
        status: 500,
      }
    );
  }
}