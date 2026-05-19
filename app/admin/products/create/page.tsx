"use client";

import { useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useRouter } from "next/navigation";

type Variant = {
  name: string;
  value: string;
  price: number;
};

type ProductForm = {
  name: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  description: string;
  active: boolean;
  featured: boolean;
  variants: Variant[];
};

export default function CreateProductPage() {
  const router = useRouter();

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [form, setForm] =
    useState<ProductForm>({
      name: "",
      price: 0,
      stock: 0,
      category: "",
      images: [],
      description: "",
      active: true,
      featured: false,
      variants: [],
    });

  // UPLOAD IMAGE
  const handleUploadImage =
    async (file: File) => {
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

        console.log(data);

        if (!response.ok) {
          alert(
            data.error ||
              "Upload gagal"
          );

          return;
        }

        setForm((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            data.url,
          ],
        }));
      } catch (error) {
        console.log(error);

        alert(
          "Upload error"
        );
      } finally {
        setUploading(false);
      }
    };

  // CREATE PRODUCT
  const handleCreate =
    async () => {
      try {
        setSaving(true);

        await addDoc(
          collection(
            db,
            "products"
          ),
          {
            ...form,
            createdAt:
              serverTimestamp(),
            updatedAt:
              serverTimestamp(),
          }
        );

        alert(
          "Produk berhasil dibuat"
        );

        router.push(
          "/admin/products"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Gagal membuat produk"
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm">

        <h1 className="text-4xl font-bold mb-10">

          Create Produk

        </h1>

        <div className="space-y-6">

          {/* IMAGES */}

          <div>

            <p className="font-semibold mb-3">

              Gambar Produk

            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (
                e
              ) => {
                const files =
                  Array.from(
                    e.target
                      .files || []
                  );

                if (
                  form.images
                    .length +
                    files.length >
                  4
                ) {
                  alert(
                    "Maksimal 4 gambar"
                  );

                  return;
                }

                for (const file of files) {
                  await handleUploadImage(
                    file
                  );
                }
              }}
              className="w-full border rounded-2xl px-4 py-3"
            />

            <p className="text-sm text-gray-500 mt-2">

              Maksimal 4 gambar

            </p>

            {uploading && (
              <p className="mt-3 text-sm text-gray-500">

                Uploading...

              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

              {form.images.map(
                (
                  img,
                  index
                ) => (
                  <div
                    key={index}
                    className="relative"
                  >

                    <img
                      src={img}
                      alt="preview"
                      className="w-full h-32 object-cover rounded-2xl"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          images:
                            form.images.filter(
                              (
                                _,
                                i
                              ) =>
                                i !==
                                index
                            ),
                        });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-sm"
                    >

                      ×

                    </button>

                  </div>
                )
              )}

            </div>

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
                  name:
                    e.target.value,
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
                form.description
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

          {/* VARIANTS */}

          <div>

            <div className="flex items-center justify-between mb-4">

              <p className="font-semibold">

                Variants Produk

              </p>

              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    variants: [
                      ...form.variants,
                      {
                        name: "",
                        value: "",
                        price: 0,
                      },
                    ],
                  });
                }}
                className="bg-black text-white px-4 py-2 rounded-xl text-sm"
              >

                Tambah Variant

              </button>

            </div>

            <div className="space-y-4">

              {form.variants.map(
                (
                  variant,
                  index
                ) => (
                  <div
                    key={index}
                    className="border rounded-2xl p-4 space-y-4"
                  >

                    <div>

                      <p className="mb-2 text-sm font-medium">

                        Nama Variant

                      </p>

                      <input
                        type="text"
                        value={
                          variant.name
                        }
                        onChange={(
                          e
                        ) => {
                          const updated =
                            [
                              ...form.variants,
                            ];

                          updated[
                            index
                          ].name =
                            e.target.value;

                          setForm({
                            ...form,
                            variants:
                              updated,
                          });
                        }}
                        placeholder="Contoh: Warna"
                        className="w-full border rounded-xl px-4 py-3"
                      />

                    </div>

                    <div>

                      <p className="mb-2 text-sm font-medium">

                        Value

                      </p>

                      <input
                        type="text"
                        value={
                          variant.value
                        }
                        onChange={(
                          e
                        ) => {
                          const updated =
                            [
                              ...form.variants,
                            ];

                          updated[
                            index
                          ].value =
                            e.target.value;

                          setForm({
                            ...form,
                            variants:
                              updated,
                          });
                        }}
                        placeholder="Contoh: Merah"
                        className="w-full border rounded-xl px-4 py-3"
                      />

                    </div>

                    <div>

                      <p className="mb-2 text-sm font-medium">

                        Harga Variant

                      </p>

                      <input
                        type="number"
                        value={
                          variant.price
                        }
                        onChange={(
                          e
                        ) => {
                          const updated =
                            [
                              ...form.variants,
                            ];

                          updated[
                            index
                          ].price =
                            Number(
                              e.target
                                .value
                            );

                          setForm({
                            ...form,
                            variants:
                              updated,
                          });
                        }}
                        className="w-full border rounded-xl px-4 py-3"
                      />

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          variants:
                            form.variants.filter(
                              (
                                _,
                                i
                              ) =>
                                i !==
                                index
                            ),
                        });
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
                    >

                      Hapus Variant

                    </button>

                  </div>
                )
              )}

            </div>

          </div>

          {/* PRICE + STOCK */}

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

          {/* CATEGORY */}

          <div>

            <p className="font-semibold mb-3">

              Kategori

            </p>

            <input
              type="text"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target
                      .value,
                })
              }
              className="w-full border rounded-2xl px-4 py-3"
            />

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
              handleCreate
            }
            disabled={saving}
            className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold"
          >

            {saving
              ? "Saving..."
              : "Create Produk"}

          </button>

        </div>

      </div>

    </main>
  );
}