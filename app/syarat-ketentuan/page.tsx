import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan | KhairaShop25",
  description:
    "Syarat transaksi, pembayaran, dan pengiriman saat berbelanja di KhairaShop25.",
  alternates: { canonical: "/syarat-ketentuan" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 shadow-sm">

        <h1 className="text-4xl font-bold mb-8">
          Syarat & Ketentuan
        </h1>

        <div className="space-y-6 text-gray-700 leading-8">

          <p>
            Seluruh transaksi di website ini
            dianggap sah setelah pembayaran
            berhasil dilakukan.
          </p>

          <p>
            Pengiriman dilakukan sesuai
            estimasi kurir yang dipilih pelanggan.
          </p>

          <p>
            Kami berhak mengubah harga,
            stok, dan kebijakan sewaktu-waktu
            tanpa pemberitahuan sebelumnya.
          </p>

        </div>

      </div>

    </main>
  );
}
