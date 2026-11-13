"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/components/providers/AuthProvider";

import AdminSidebar from "@/components/admin/AdminSidebar";

import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router =
    useRouter();

  const {
    user,
    adminData,
    loading,
  } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login-admin");
      }

      if (
        user &&
        !adminData
      ) {
        router.push("/");
      }
    }
  }, [
    user,
    adminData,
    loading,
  ]);

  useEffect(() => {

  console.log("USER:", user);

  console.log("ADMIN DATA:", adminData);

  console.log("LOADING:", loading);

  if (!loading) {

    if (!user) {
      router.push("/login-admin");
    }

    if (user && !adminData) {
      router.push("/");
    }

  }

}, [user, adminData, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user || !adminData) {
    return null;
  }

  return (
    <div className="flex bg-[#faf7f2]">

      <AdminSidebar />

      <div className="flex-1 min-h-screen">

        <AdminTopbar />

        <div className="p-8">
          {children}
        </div>

      </div>

    </div>
  );
}