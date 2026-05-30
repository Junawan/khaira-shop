"use client";

import { useState } from "react";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleRegister =
    async () => {
      try {
        setLoading(true);

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const uid =
          result.user.uid;

        await setDoc(
          doc(
            db,
            "customers",
            uid
          ),
          {
            name,
            email,

            phone: "",

            defaultAddressId:
              "",

            createdAt:
              serverTimestamp(),
          }
        );

        alert(
          "Registrasi berhasil"
        );

        router.push(
          "/account"
        );
      } catch (error: any) {
        console.log(error);

        alert(
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f4ef]">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow">

        <h1 className="text-3xl font-bold mb-6">
          Daftar Akun
        </h1>

        <input
          type="text"
          placeholder="Nama"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          onClick={
            handleRegister
          }
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          {loading
            ? "Loading..."
            : "Daftar"}
        </button>
      </div>
    </main>
  );
}