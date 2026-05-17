"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  useAuth,
} from "@/components/providers/AuthProvider";

type AdminUser = {
  id: string;

  name: string;

  email: string;

  role: string;
};

export default function AdminManagementPage() {
  const { hasAccess } =
    useAuth();

  const [admins, setAdmins] =
    useState<AdminUser[]>(
      []
    );

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("staff");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins =
    async () => {
      const snapshot =
        await getDocs(
          collection(
            db,
            "admins"
          )
        );

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<
              AdminUser,
              "id"
            >),
          })
        );

      setAdmins(data);
    };

  const createAdmin =
    async () => {
      try {
        await addDoc(
          collection(
            db,
            "admins"
          ),
          {
            name,
            email,
            role,
          }
        );

        alert(
          "Admin berhasil ditambahkan"
        );

        setName("");
        setEmail("");
        setRole("staff");

        fetchAdmins();
      } catch (error) {
        console.log(error);
      }
    };

  const deleteAdmin =
    async (id: string) => {
      const confirmDelete =
        confirm(
          "Hapus admin?"
        );

      if (!confirmDelete)
        return;

      try {
        await deleteDoc(
          doc(
            db,
            "admins",
            id
          )
        );

        fetchAdmins();
      } catch (error) {
        console.log(error);
      }
    };

  if (
    !hasAccess("admins")
  ) {
    return (
      <div className="text-red-500">
        Tidak punya akses
      </div>
    );
  }

  return (
    <main>

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            Admin Management
          </h1>

          <p className="text-gray-500 mt-2">
            Kelola admin dashboard
          </p>

        </div>

      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Tambah Admin
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="border rounded-2xl px-4 py-3"
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
            className="border rounded-2xl px-4 py-3"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
            className="border rounded-2xl px-4 py-3"
          >
            <option value="staff">
              Staff
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="super_admin">
              Super Admin
            </option>

          </select>

        </div>

        <button
          onClick={
            createAdmin
          }
          className="mt-5 bg-black text-white px-6 py-4 rounded-2xl"
        >
          Tambah Admin
        </button>

      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm">

        <h2 className="text-2xl font-bold mb-6">
          List Admin
        </h2>

        <div className="space-y-4">

          {admins.map(
            (admin) => (
              <div
                key={admin.id}
                className="border rounded-2xl p-5 flex items-center justify-between"
              >

                <div>

                  <h3 className="font-bold text-lg">
                    {
                      admin.name
                    }
                  </h3>

                  <p className="text-gray-500">
                    {
                      admin.email
                    }
                  </p>

                  <p className="mt-2 text-sm font-semibold uppercase">
                    {
                      admin.role
                    }
                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteAdmin(
                      admin.id
                    )
                  }
                  className="bg-red-500 text-white px-5 py-3 rounded-xl"
                >
                  Hapus
                </button>

              </div>
            )
          )}

        </div>

      </div>

    </main>
  );
}