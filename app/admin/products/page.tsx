"use client";

import { useState } from "react";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  addDoc,
  collection,
} from "firebase/firestore";

import { storage, db } from "@/lib/firebase";

import { v4 as uuidv4 } from "uuid";

export default function AddProductPage() {
  const [name, setName] = useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] = useState("");

  const [weight, setWeight] =
    useState("");

  const [length, setLength] =
    useState("");

  const [width, setWidth] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [image, setImage] =
    useState<File | null>(null);
    const [variants, setVariants] =
  useState([
    {
      name: "",
      price: "",
    },
  ]);

  const [loading, setLoading] =
    useState(false);

    const addVariant = () => {
  setVariants([
    ...variants,

    {
      name: "",
      price: "",
    },
  ]);
};

const updateVariant = (
  index: number,
  field: string,
  value: string
) => {
  const updated = [...variants];

  updated[index] = {
    ...updated[index],

    [field]: value,
  };

  setVariants(updated);
};
  const handleUpload = async () => {
    try {
      if (!image) {
        alert("Pilih gambar");
        return;
      }

      setLoading(true);

      // Upload image
      const imageRef = ref(
        storage,
        `products/${uuidv4()}`
      );

      await uploadBytes(imageRef, image);

      const imageUrl =
        await getDownloadURL(imageRef);

      // Save firestore
      await addDoc(
        collection(db, "products"),
        {
          name,

          description,

          image: imageUrl,

          price: Number(price),

variants: variants.map((v) => ({
  name: v.name,

  price: Number(v.price),
})),

          weight: Number(weight),

          length: Number(length),

          width: Number(width),

          height: Number(height),

          createdAt: new Date(),
        }
      );

      alert("Produk berhasil ditambahkan");

      setName("");

      setDescription("");

      setPrice("");

      setWeight("");

      setLength("");

      setWidth("");

      setHeight("");

      setImage(null);
    } catch (error) {
      console.error(error);

      alert("Gagal upload produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm">

        <h1 className="text-3xl font-bold mb-8">
          Tambah Produk
        </h1>

        <div className="space-y-5">

          {/* Nama */}
          <input
            type="text"
            placeholder="Nama produk"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
          />

          {/* Deskripsi */}
          <textarea
            placeholder="Deskripsi produk"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 h-40"
          />

          {/* Harga */}
          <input
            type="number"
            placeholder="Harga"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
          />

          {/* Berat */}
          <input
            type="number"
            placeholder="Berat gram"
            value={weight}
            onChange={(e) =>
              setWeight(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
          />

          {/* Dimensi */}
          <div className="grid grid-cols-3 gap-4">

            <input
              type="number"
              placeholder="Panjang cm"
              value={length}
              onChange={(e) =>
                setLength(e.target.value)
              }
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <input
              type="number"
              placeholder="Lebar cm"
              value={width}
              onChange={(e) =>
                setWidth(e.target.value)
              }
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <input
              type="number"
              placeholder="Tinggi cm"
              value={height}
              onChange={(e) =>
                setHeight(e.target.value)
              }
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

          </div>

{/* VARIANT */}

<div className="space-y-4">

  <div className="flex items-center justify-between">

    <h2 className="font-semibold text-lg">
      Varian Produk
    </h2>

    <button
      type="button"
      onClick={addVariant}
      className="bg-gray-200 px-4 py-2 rounded-xl"
    >
      + Tambah Varian
    </button>

  </div>

  {variants.map((variant, index) => (
    <div
      key={index}
      className="grid grid-cols-2 gap-4"
    >

      <input
        type="text"
        placeholder="Nama varian"
        value={variant.name}
        onChange={(e) =>
          updateVariant(
            index,
            "name",
            e.target.value
          )
        }
        className="border border-gray-300 rounded-xl px-4 py-3"
      />

      <input
        type="number"
        placeholder="Harga varian"
        value={variant.price}
        onChange={(e) =>
          updateVariant(
            index,
            "price",
            e.target.value
          )
        }
        className="border border-gray-300 rounded-xl px-4 py-3"
      />

    </div>
  ))}

</div>

          {/* Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(
                e.target.files?.[0] || null
              )
            }
            className="w-full"
          />

          {/* Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl hover:opacity-90"
          >
            {loading
              ? "Uploading..."
              : "Tambah Produk"}
          </button>

        </div>
      </div>
    </main>
  );
}