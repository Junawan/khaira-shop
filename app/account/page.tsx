"use client";

import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();

  const [uid, setUid] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

    const [phone, setPhone] =
  useState("");

  const [address, setAddress] =
  useState("");

const [postalCode, setPostalCode] =
  useState("");

  const [addresses, setAddresses] =
  useState<any[]>([]);

const [showModal, setShowModal] =
  useState(false);

const [label, setLabel] =
  useState("");

const [receiverName, setReceiverName] =
  useState("");

const [receiverPhone, setReceiverPhone] =
  useState("");

const [newAddress, setNewAddress] =
  useState("");

const [newPostalCode, setNewPostalCode] =
  useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            router.push("/login");
            return;
          }

          setUid(user.uid);

          const docRef = doc(
            db,
            "customers",
            user.uid
          );

          const snap =
            await getDoc(docRef);

          if (snap.exists()) {
            const data =
              snap.data();

            setName(
              data.name || ""
            );

            setEmail(
              data.email || ""
            );

            setPhone(
              data.phone || ""
            );

            setAddress(
  data.address || ""
);

setPostalCode(
  data.postalCode || ""
);
          }

          await loadAddresses(
  user.uid
);

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const addAddress =
  async () => {

    if (
      !label ||
      !receiverName ||
      !receiverPhone ||
      !newAddress ||
      !newPostalCode
    ) {
      alert(
        "Lengkapi semua data"
      );
      return;
    }

    try {

      await addDoc(
        collection(
          db,
          "customers",
          uid,
          "addresses"
        ),
        {
          label,
          receiverName,
          phone:
            receiverPhone,
          address:
            newAddress,
          postalCode:
            newPostalCode,
        }
      );

      await loadAddresses(uid);

      setLabel("");
      setReceiverName("");
      setReceiverPhone("");
      setNewAddress("");
      setNewPostalCode("");

      setShowModal(false);

    } catch (error) {

      console.log(error);

      alert(
        "Gagal menyimpan alamat"
      );
    }
  };

  const removeAddress =
  async (
    addressId: string
  ) => {

    if (
      !confirm(
        "Hapus alamat?"
      )
    )
      return;

    await deleteDoc(
      doc(
        db,
        "customers",
        uid,
        "addresses",
        addressId
      )
    );

    loadAddresses(uid);
  };

  const loadAddresses =
  async (userId: string) => {

    const snap =
      await getDocs(
        collection(
          db,
          "customers",
          userId,
          "addresses"
        )
      );

    const data =
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    setAddresses(data);
  };

  const saveProfile =
    async () => {
      try {
        await updateDoc(
  doc(
    db,
    "customers",
    uid
  ),
  {
    name,
    phone,
    address,
    postalCode,
  }
);

        alert(
          "Profil berhasil disimpan"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Gagal menyimpan profil"
        );
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

      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl p-8 shadow-sm">

          <h1 className="text-3xl font-bold mb-8">
            Akun Saya
          </h1>

          <div className="space-y-5">

            <div>
              <label className="block mb-2 font-medium">
                Nama
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                value={email}
                disabled
                className="w-full border rounded-xl p-3 bg-gray-100"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Nomor HP
              </label>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
  <label className="block mb-2 font-medium">
    Alamat Utama
  </label>

  <textarea
    value={address}
    onChange={(e) =>
      setAddress(
        e.target.value
      )
    }
    className="w-full border rounded-xl p-3 h-32"
  />
</div>

<div>
  <label className="block mb-2 font-medium">
    Kode Pos
  </label>

  <input
    type="text"
    value={postalCode}
    onChange={(e) =>
      setPostalCode(
        e.target.value
      )
    }
    className="w-full border rounded-xl p-3"
  />
</div>

            <button
              onClick={
                saveProfile
              }
              className="bg-black text-white px-6 py-3 rounded-xl"
            >
              Simpan
            </button>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm mt-6">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Alamat Saya
            </h2>

            <button
  onClick={() =>
    setShowModal(true)
  }
  className="bg-black text-white px-5 py-3 rounded-xl"
>
  + Tambah Alamat
</button>

          </div>

          <div className="mt-6 space-y-4">

  {addresses.length === 0 ? (

    <div className="text-gray-500">
      Belum ada alamat
    </div>

  ) : (

    addresses.map(
      (addr) => (

        <div
          key={addr.id}
          className="border rounded-2xl p-5"
        >

          <div className="flex justify-between">

            <h3 className="font-bold">
              {addr.label}
            </h3>

            <button
              onClick={() =>
                removeAddress(
                  addr.id
                )
              }
              className="text-red-500"
            >
              Hapus
            </button>

          </div>

          <p className="mt-2">
            {
              addr.receiverName
            }
          </p>

          <p>
            {addr.phone}
          </p>

          <p className="text-gray-600">
            {
              addr.address
            }
          </p>

          <p className="text-gray-500">
            {
              addr.postalCode
            }
          </p>

        </div>
      )
    )

  )}

</div>

        </div>

      </div>

      {showModal && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

    <div className="bg-white rounded-3xl p-6 w-full max-w-lg">

      <h2 className="text-2xl font-bold mb-5">
        Tambah Alamat
      </h2>

      <div className="space-y-4">

        <input
          placeholder="Label (Rumah, Gudang, dll)"
          value={label}
          onChange={(e) =>
            setLabel(
              e.target.value
            )
          }
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Nama Penerima"
          value={
            receiverName
          }
          onChange={(e) =>
            setReceiverName(
              e.target.value
            )
          }
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="Nomor HP"
          value={
            receiverPhone
          }
          onChange={(e) =>
            setReceiverPhone(
              e.target.value
            )
          }
          className="w-full border rounded-xl p-3"
        />

        <textarea
          placeholder="Alamat"
          value={
            newAddress
          }
          onChange={(e) =>
            setNewAddress(
              e.target.value
            )
          }
          className="w-full border rounded-xl p-3 h-28"
        />

        <input
          placeholder="Kode Pos"
          value={
            newPostalCode
          }
          onChange={(e) =>
            setNewPostalCode(
              e.target.value
            )
          }
          className="w-full border rounded-xl p-3"
        />

        <div className="flex gap-3">

          <button
            onClick={
              addAddress
            }
            className="flex-1 bg-black text-white py-3 rounded-xl"
          >
            Simpan
          </button>

          <button
            onClick={() =>
              setShowModal(
                false
              )
            }
            className="flex-1 border py-3 rounded-xl"
          >
            Batal
          </button>

        </div>

      </div>

    </div>

  </div>

)}

    </main>
  );
}