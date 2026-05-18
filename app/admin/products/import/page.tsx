"use client";

import { useState } from "react";

import * as XLSX from "xlsx";

type ProductRow = {
  name: string;

  type: string;

  category?: string;

  description?: string;

  image?: string;

  price?: number;

  stock?: number;

  weight?: number;

  packageLength?: number;

  packageWidth?: number;

  packageHeight?: number;

  variantName?: string;

  variantValue?: string;
};

export default function ImportProductsPage() {
  const [rows, setRows] = useState<
    ProductRow[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const data =
      await file.arrayBuffer();

    const workbook =
      XLSX.read(data);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const json =
      XLSX.utils.sheet_to_json(
        sheet
      ) as ProductRow[];

    setRows(json);
  };

  const handleImport =
    async () => {
      try {
        setLoading(true);

        const response =
          await fetch(
            "/api/admin/import-products",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                products: rows,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          alert(
            "Import gagal"
          );

          console.log(data);

          return;
        }

        alert(
          "Import berhasil"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Terjadi kesalahan"
        );
      } finally {
        setLoading(false);
      }
    };

    const downloadSingleTemplate = () => {
  const data = [
    {
      name: "Loyang Pai Bali",
      type: "single",
      category: "Loyang",
      description:
        "Loyang premium anti lengket",
      image:
        "https://yourdomain.com/produk.jpg",
      price: 85000,
      stock: 10,
      weight: 500,
      packageLength: 20,
      packageWidth: 20,
      packageHeight: 10,
    },
  ];

  const worksheet =
    XLSX.utils.json_to_sheet(data);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Single Product"
  );

  XLSX.writeFile(
    workbook,
    "template-produk-single.xlsx"
  );
};

const downloadVariantTemplate = () => {
  const data = [
    {
      name: "Hijab Paris",
      type: "variant",
      category: "Hijab",
      description:
        "Hijab premium adem",
      image:
        "https://yourdomain.com/hijab.jpg",
      variantName: "Warna",
      variantValue: "Hitam",
      price: 75000,
      stock: 5,
      weight: 300,
      packageLength: 15,
      packageWidth: 15,
      packageHeight: 3,
    },

    {
      name: "Hijab Paris",
      type: "variant",
      category: "Hijab",
      description:
        "Hijab premium adem",
      image:
        "https://yourdomain.com/hijab.jpg",
      variantName: "Warna",
      variantValue: "Cream",
      price: 75000,
      stock: 8,
      weight: 300,
      packageLength: 15,
      packageWidth: 15,
      packageHeight: 3,
    },
  ];

  const worksheet =
    XLSX.utils.json_to_sheet(data);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Variant Product"
  );

  XLSX.writeFile(
    workbook,
    "template-produk-variant.xlsx"
  );
};

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <h1 className="text-4xl font-bold mb-8">
            Import Produk Excel
          </h1>

          <div className="flex flex-wrap gap-4 mb-6">

  <button
    onClick={downloadSingleTemplate}
    className="bg-blue-600 text-white px-5 py-3 rounded-2xl"
  >
    Download Template Produk Satuan
  </button>

  <button
    onClick={downloadVariantTemplate}
    className="bg-purple-600 text-white px-5 py-3 rounded-2xl"
  >
    Download Template Produk Varian
  </button>

</div>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="mb-6"
          />

          {rows.length > 0 && (
            <>

              <div className="overflow-auto border rounded-2xl">

                <table className="w-full text-sm">

                  <thead className="bg-black text-white">

                    <tr>

                      <th className="p-3 text-left">
                        Nama
                      </th>

                      <th className="p-3 text-left">
                        Type
                      </th>

                      <th className="p-3 text-left">
                        Harga
                      </th>

                      <th className="p-3 text-left">
                        Stock
                      </th>

                      <th className="p-3 text-left">
                        Variant
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {rows.map(
                      (row, index) => (
                        <tr
                          key={index}
                          className="border-t"
                        >

                          <td className="p-3">
                            {row.name}
                          </td>

                          <td className="p-3">
                            {row.type}
                          </td>

                          <td className="p-3">
                            {row.price}
                          </td>

                          <td className="p-3">
                            {row.stock}
                          </td>

                          <td className="p-3">
                            {row.variantName}
                            :
                            {" "}
                            {
                              row.variantValue
                            }
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              <button
                onClick={handleImport}
                disabled={loading}
                className="mt-6 bg-black text-white px-6 py-4 rounded-2xl"
              >
                {loading
                  ? "Importing..."
                  : "Import Produk"}
              </button>

            </>
          )}

        </div>

      </div>

    </main>
  );
}