"use client";

export default function AdminTopbar() {
  return (
    <div className="bg-white border-b px-8 py-5 flex items-center justify-between">

      <div>

        <h2 className="text-2xl font-bold">
          Admin Panel
        </h2>

      </div>

      <div className="flex items-center gap-4">

        <div className="text-right">

          <p className="font-semibold">
            Admin
          </p>

          <p className="text-sm text-gray-500">
            Super Admin
          </p>

        </div>

        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold">

          A

        </div>

      </div>

    </div>
  );
}