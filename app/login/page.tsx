"use client";

import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin =
    async () => {
      try {
        setLoading(true);

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        router.push("/");
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf7f2]">

      <div className="bg-white p-8 rounded-3xl shadow w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6">
          Masuk
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          {loading
            ? "Loading..."
            : "Masuk"}
        </button>

      </div>

    </main>
  );
}