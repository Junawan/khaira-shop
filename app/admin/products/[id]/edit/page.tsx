"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  useParams,
  useRouter,
} from "next/navigation";

type Product = {
  name: string;

  price: number;

  stock: number;

  type?: string;

  category?: string;

  image?: string;

  description?: string;

  active?: boolean;

  featured?: boolean;

  variants?: {
    name: string;
    values: {
      value: string;
      price: number;
      stock?: number;
    }[];
  }[];
};

const categories = [
  "Loyang",
  "Cetakan Kue",
  "Peralatan Dapur",
  "Baking Tools",
  "Aksesoris",
  "Kukusan",
  "pemanggang",
  "Oven",
  "Lampu",
  "Rak",
  "Dandang",
];

export default function EditProductPage() {
  const params = useParams();

  const router = useRouter();

  const productId =
    params.id as string;

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

    const [uploading, setUploading] =
  useState(false);

  const [form, setForm] =
    useState<Product>({
      name: "",

      price: 0,

      stock: 0,

      category: "",

      image: "",

      description: "",

      active: true,

      featured: false,
    });

  // GET PRODUCT
  useEffect(() => {
    const fetchProduct =
      async () => {
        try {
          const productRef =
            doc(
              db,
              "products",
              productId
            );

          const snapshot =
            await getDoc(
              productRef
            );

          if (
            snapshot.exists()
          ) {
            setForm(
              snapshot.data() as Product
            );
          }
        } catch (error) {
          console.log(error);

          alert(
            "Gagal mengambil produk"
          );
        } finally {
          setLoading(false);
        }
      };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleUploadImage =
  async (
    file: File
  ) => {
    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/upload-image",
          {
            method: "POST",

            body: formData,
          }
        );

      const data =
        await response.json();

      if (!data.url) {
        alert(
          "Upload gagal"
        );

        return;
      }

      setForm({
        ...form,
        image: data.url,
      });
    } catch (error) {
      console.log(error);

      alert(
        "Upload error"
      );
    } finally {
      setUploading(false);
    }
  };

  // UPDATE
  const handleUpdate =
    async () => {
      try {
        setSaving(true);

        const productRef =
          doc(
            db,
            "products",
            productId
          );

        await updateDoc(
          productRef,
          {
            ...form,

            updatedAt:
              new Date(),
          }
        );

        alert(
          "Produk berhasil diupdate"
        );

        router.push(
          "/admin/products"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Gagal update produk"
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm">

        <h1 className="text-4xl font-bold mb-10">

          Edit Produk

        </h1>

        <div className="space-y-6">

          {/* IMAGE */}

          <div>

            <p className="font-semibold mb-3">

              Gambar Produk

            </p>

            <div>

  <p className="font-semibold mb-3">

    Gambar Produk

  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file =
        e.target.files?.[0];

      if (file) {
        handleUploadImage(
          file
        );
      }
    }}
    className="w-full border rounded-2xl px-4 py-3"
  />

  {uploading && (
    <p className="mt-3 text-sm text-gray-500">

      Uploading...

    </p>
  )}

  {form.image && (
    <img
      src={form.image}
      alt="preview"
      className="w-48 h-48 object-cover rounded-2xl mt-5"
    />
  )}

</div>

            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="w-40 h-40 object-cover rounded-2xl mt-4"
              />
            )}

          </div>

          {/* NAME */}

          <div>

            <p className="font-semibold mb-3">

              Nama Produk

            </p>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full border rounded-2xl px-4 py-3"
            />

          </div>

          {/* DESCRIPTION */}

          <div>

            <p className="font-semibold mb-3">

              Deskripsi

            </p>

            <textarea
              value={
                form.description ||
                ""
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target
                      .value,
                })
              }
              className="w-full border rounded-2xl px-4 py-3 h-40"
            />

          </div>

          {form.variants &&
  form.variants.length > 0 && (

  <div>

    <p className="font-semibold mb-4">
      Varian Produk
    </p>

    {form.variants.map(
      (variant, variantIndex) => (

      <div
        key={variantIndex}
        className="border rounded-2xl p-4 mb-4"
      >

        <h3 className="font-bold mb-4">
          {variant.name}
        </h3>

        {variant.values.map(
          (item, valueIndex) => (

          <div
            key={valueIndex}
            className="grid md:grid-cols-3 gap-4 mb-4"
          >

            <input
              type="text"
              value={item.value}
              disabled
              className="border rounded-xl px-3 py-2"
            />

            <input
              type="number"
              value={item.price}
              onChange={(e) => {

                const newVariants =
                  [...form.variants!];

                newVariants[
                  variantIndex
                ].values[
                  valueIndex
                ].price =
                  Number(
                    e.target.value
                  );

                setForm({
                  ...form,
                  variants:
                    newVariants,
                });

              }}
              className="border rounded-xl px-3 py-2"
            />

            <input
              type="number"
              value={
                item.stock || 0
              }
              onChange={(e) => {

                const newVariants =
                  [...form.variants!];

                newVariants[
                  variantIndex
                ].values[
                  valueIndex
                ].stock =
                  Number(
                    e.target.value
                  );

                setForm({
                  ...form,
                  variants:
                    newVariants,
                });

              }}
              className="border rounded-xl px-3 py-2"
            />

          </div>

        ))}

      </div>

    ))}

  </div>

)}

          {/* PRICE + STOCK */}

          {form.type !== "variant" && (

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <p className="font-semibold mb-3">

                Harga

              </p>

              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price:
                      Number(
                        e.target
                          .value
                      ),
                  })
                }
                className="w-full border rounded-2xl px-4 py-3"
              />

            </div>

            <div>

              <p className="font-semibold mb-3">

                Stock

              </p>

              <input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock:
                      Number(
                        e.target
                          .value
                      ),
                  })
                }
                className="w-full border rounded-2xl px-4 py-3"
              />

            </div>

          </div>

          )}

          {/* KATEGORI */}
<div>
  <p className="font-semibold mb-3">
    Kategori
  </p>

  <select
    value={form.category || ""}
    onChange={(e) =>
      setForm({
        ...form,
        category: e.target.value,
      })
    }
    className="w-full border rounded-2xl px-4 py-3"
  >
    <option value="">
      Pilih Kategori
    </option>

    {categories.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
</div>

          {/* ACTIVE */}

          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">

            <div>

              <p className="font-semibold">

                Active Product

              </p>

              <p className="text-sm text-gray-500">

                Produk tampil di toko

              </p>

            </div>

            <input
              type="checkbox"
              checked={
                form.active
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  active:
                    e.target
                      .checked,
                })
              }
              className="w-5 h-5"
            />

          </div>

          {/* FEATURED */}

          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">

            <div>

              <p className="font-semibold">

                Featured Product

              </p>

              <p className="text-sm text-gray-500">

                Produk unggulan

              </p>

            </div>

            <input
              type="checkbox"
              checked={
                form.featured
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  featured:
                    e.target
                      .checked,
                })
              }
              className="w-5 h-5"
            />

          </div>

          {/* BUTTON */}

          <button
            onClick={
              handleUpdate
            }
            disabled={saving}
            className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold"
          >

            {saving
              ? "Saving..."
              : "Update Produk"}

          </button>

        </div>

      </div>

    </main>
  );
}