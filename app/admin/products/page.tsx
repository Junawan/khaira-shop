"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";

import * as XLSX from "xlsx";

type Product = {
  id: string;

  name: string;

  price: number;

  stock: number;

  variants?: {
    name: string;
    values: {
      value: string;
      price: number;
      stock?: number;
    }[];
  }[];

  category?: string;

  image?: string;

  active?: boolean;

  featured?: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  // REALTIME
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {
        const data: Product[] =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<
                Product,
                "id"
              >),
            })
          );

        setProducts(data);

        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const handleDownloadExcel =
async () => {

  const rows: any[] = [];

  products.forEach((product) => {

    if (
      product.variants &&
      product.variants.length > 0
    ) {

      product.variants.forEach(
        (variant: any) => {

          variant.values.forEach(
            (value: any) => {

              rows.push({
  productId: product.id,
  name: product.name,
  category: product.category || "",
  variant: value.value,
  price: value.price,
  stock: value.stock,
});

            }
          );

        }
      );

    } else {

      rows.push({
  productId: product.id,
  name: product.name,
  category: product.category || "",
  variant: "",
  price: product.price,
  stock: product.stock,
});

    }

  });

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Products"
  );

  XLSX.writeFile(
    workbook,
    "products.xlsx"
  );

};

const handleUploadExcel = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  try {

    const buffer =
      await file.arrayBuffer();

    const workbook =
      XLSX.read(buffer);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows: any[] =
      XLSX.utils.sheet_to_json(
        sheet
      );

    let updatedCount = 0;

    for (const row of rows) {

      const productRef = doc(
        db,
        "products",
        row.productId
      );

      const productSnap =
        await getDoc(productRef);

      if (!productSnap.exists())
        continue;

      const productData =
        productSnap.data();

      // PRODUK VARIAN
      if (
        productData.variants &&
        productData.variants.length > 0
      ) {

        const updatedVariants =
          productData.variants.map(
            (variant: any) => ({

              ...variant,

              values:
                variant.values.map(
                  (value: any) => {

                    if (
                      value.value ===
                      row.variant
                    ) {

                      return {
                        ...value,

                        price:
                          Number(
                            row.price
                          ),

                        stock:
                          Number(
                            row.stock
                          ),
                      };

                    }

                    return value;

                  }
                ),

            })
          );

        await updateDoc(
  productRef,
  {
    variants: updatedVariants,
    category: row.category || "",
    updatedAt: new Date(),
  }
);

      }

      // PRODUK TANPA VARIAN
      else {

        await updateDoc(
  productRef,
  {
    price: Number(row.price),
    stock: Number(row.stock),
    updatedAt: new Date(),
  }
);

      }

      updatedCount++;

    }

    alert(
      `${updatedCount} produk berhasil diperbarui`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Upload Excel gagal"
    );

  }

};

  // DELETE
  const handleDelete =
    async (id: string) => {
      const confirmDelete =
        confirm(
          "Hapus produk?"
        );

      if (!confirmDelete)
        return;

      try {
        await deleteDoc(
          doc(
            db,
            "products",
            id
          )
        );

        alert(
          "Produk berhasil dihapus"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Gagal hapus produk"
        );
      }
    };

  // FILTER
  const filteredProducts =
    products.filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">

          <div>
            <h1 className="text-4xl font-bold">
              Products
            </h1>

            <p className="text-gray-500 mt-2">
              Total:
              {" "}
              {
                products.length
              }
              {" "}
              produk
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

  <Link
    href="/admin/products/create"
    className="
      bg-black
      text-white
      px-5 py-3
      rounded-2xl
    "
  >
    Tambah Produk
  </Link>

  <button
    onClick={handleDownloadExcel}
    className="
      bg-green-600
      text-white
      px-5 py-3
      rounded-2xl
    "
  >
    Download Excel
  </button>

  <label
    className="
      bg-blue-600
      text-white
      px-5 py-3
      rounded-2xl
      cursor-pointer
    "
  >
    Upload Excel

    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleUploadExcel}
      className="hidden"
    />
  </label>

</div>

          <Link
            href="/admin/products/create"
          >
            <button className="bg-black text-white px-5 py-4 rounded-2xl flex items-center gap-2">

              <Plus size={20} />

              Tambah Produk

            </button>
          </Link>

        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-3xl p-4 shadow-sm mb-8 flex items-center gap-3">

          <Search
            className="text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full outline-none"
          />

        </div>

        {/* EMPTY */}

        {filteredProducts.length ===
        0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">

            Tidak ada produk

          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {filteredProducts.map(
              (product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm"
                >

                  {/* IMAGE */}

                  <div className="aspect-square bg-gray-100">

                    {product.image ? (
                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">

                        No Image

                      </div>
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="p-5">

                    <div className="flex flex-wrap gap-2 mb-3">

                      {product.active ? (
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">

                          Active

                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">

                          Hidden

                        </span>
                      )}

                      {product.featured && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">

                          Featured

                        </span>
                      )}

                      {product.stock <=
                        5 && (
                        <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">

                          Low Stock

                        </span>
                      )}

                    </div>

                    <h2 className="font-bold text-xl line-clamp-2">

                      {
                        product.name
                      }

                    </h2>

                    <p className="text-gray-500 mt-2">

                      {
                        product.category ||
                        "-"
                      }

                    </p>

                    <div className="mt-5 space-y-2">

                      <div className="flex justify-between">

                        <span className="text-gray-500">
                          Harga
                        </span>

                        <span className="font-bold">
                          Rp
                          {product.price?.toLocaleString()}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-gray-500">
                          Stock
                        </span>

                        <span className="font-bold">

                          {
                            product.stock
                          }

                        </span>

                      </div>

                    </div>

                    {/* ACTION */}

                    <div className="mt-6 flex gap-3">

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex-1"
                      >

                        <button className="w-full bg-black text-white py-3 rounded-2xl flex items-center justify-center gap-2">

                          <Pencil size={18} />

                          Edit

                        </button>

                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            product.id
                          )
                        }
                        className="bg-red-500 text-white px-5 rounded-2xl flex items-center justify-center"
                      >

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </main>
  );
}