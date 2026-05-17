"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import { hasPermission } from "@/lib/permissions";

type AdminData = {
  role: string;

  name: string;

  email: string;
};

type AuthContextType = {
  user: User | null;

  adminData: AdminData | null;

  loading: boolean;

  hasAccess: (
    permission: string
  ) => boolean;
};

const AuthContext =
  createContext<AuthContextType>({
    user: null,

    adminData: null,

    loading: true,

    hasAccess: () => false,
  });

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [adminData, setAdminData] =
    useState<AdminData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);

          if (currentUser) {
            try {
              const adminRef =
                doc(
                  db,
                  "admins",
                  currentUser.uid
                );

              const adminSnap =
                await getDoc(
                  adminRef
                );

              if (
                adminSnap.exists()
              ) {
                setAdminData(
                  adminSnap.data() as AdminData
                );
              } else {
                setAdminData(
                  null
                );
              }
            } catch (error) {
              console.log(error);

              setAdminData(
                null
              );
            }
          } else {
            setAdminData(null);
          }

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const hasAccess = (
    permission: string
  ) => {
    if (!adminData)
      return false;

    return hasPermission(
      adminData.role,
      permission
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminData,
        loading,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);