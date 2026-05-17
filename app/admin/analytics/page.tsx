"use client";

import { useEffect, useState } from "react";

type Analytics = {
  revenue: number;

  totalOrders: number;

  averageOrderValue: number;

  repeatCustomers: number;

  predictedRevenue: number;

  bestSeller: [string, number][];
};

export default function AnalyticsPage() {
  const [data, setData] =
    useState<Analytics | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics =
    async () => {
      try {
        const response =
          await fetch(
            "/api/analytics/ai"
          );

        const result =
          await response.json();

        setData(result);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10">
        Analytics kosong
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-10">
          AI Analytics Dashboard
        </h1>

        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-gray-500">
              Revenue
            </p>

            <h2 className="text-3xl font-bold mt-3">
              Rp
              {data.revenue.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-gray-500">
              Orders
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {data.totalOrders}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-gray-500">
              Repeat Customer
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {
                data.repeatCustomers
              }
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-gray-500">
              AI Revenue Prediction
            </p>

            <h2 className="text-3xl font-bold mt-3">
              Rp
              {data.predictedRevenue.toLocaleString()}
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <h2 className="text-2xl font-bold mb-6">
            Best Seller Products
          </h2>

          <div className="space-y-4">

            {data.bestSeller.map(
              (item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4"
                >

                  <p className="font-semibold">
                    {item[0]}
                  </p>

                  <p>
                    {item[1]} terjual
                  </p>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </main>
  );
}