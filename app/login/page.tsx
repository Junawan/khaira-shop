"use client";

import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase";

import {
  useRouter,
} from "next/navigation";

export default function LoginPage() {
  const router =
    useRouter();

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

        router.push("/admin");
      } catch (error) {
        console.log(error);

        alert("Login gagal");
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl p-10 shadow-sm w-full max-w-md">

        <h1 className="text-4xl font-black mb-3">
          Admin Login
        </h1>

        <p className="text-gray-500 mb-8">
          Masuk ke dashboard
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full border rounded-2xl px-5 py-4"
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
            className="w-full border rounded-2xl px-5 py-4"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl"
          >
            {loading
              ? "Loading..."
              : "Login"}
          </button>

        </div>

      </div>

    </main>
  );
}