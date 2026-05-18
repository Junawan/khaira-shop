"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function LoginAdminPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      document.cookie =
  "admin-auth=true; path=/";

      router.push("/admin/orders");
    } catch (error) {
      console.log(error);

      alert("Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf7f2] p-6">

      <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-md">

        <h1 className="text-3xl font-bold mb-8 text-center">
          Admin Login
        </h1>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-2xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-2xl px-4 py-3"
          />

          <button
            onClick={handleLogin}
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