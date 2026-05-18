"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

const menus = [
  {
    name: "Dashboard",
    href: "/admin",
  },

  {
    name: "Orders",
    href: "/admin/orders",
  },

  {
    name: "Products",
    href: "/admin/products",
  },

  {
    name: "Import Excel",
    href:
      "/admin/products/import",
  },
];

export default function AdminSidebar() {
  const pathname =
    usePathname();

  return (
    <aside className="w-72 bg-black text-white min-h-screen p-6">

      <div className="mb-10">

        <h1 className="text-3xl font-black">
          KHAIRA
        </h1>

        <p className="text-gray-400 mt-2">
          Admin Dashboard
        </p>

      </div>

      <nav className="space-y-2">

        {menus.map((menu) => {
          const active =
            pathname ===
            menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`block px-5 py-4 rounded-2xl transition ${
                active
                  ? "bg-white text-black font-bold"
                  : "hover:bg-white/10"
              }`}
            >
              {menu.name}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}