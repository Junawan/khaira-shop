import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | KhairaShop25",
  description:
    "Informasi tentang data yang digunakan KhairaShop25 untuk akun, pesanan, pembayaran, pengiriman, dan layanan toko.",
  alternates: { canonical: "/kebijakan-privasi" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">
      <article className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-sm space-y-6 text-gray-700 leading-8">
        <header>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Kebijakan Privasi</h1>
          <p className="text-sm text-gray-500">Terakhir diperbarui: 13 November 2026</p>
        </header>

        <p>
          Kebijakan ini menjelaskan bagaimana KhairaShop25 menggunakan informasi
          ketika Anda mengunjungi toko, membuat akun, atau melakukan pemesanan.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Informasi yang digunakan</h2>
          <p>
            Untuk menjalankan akun dan pesanan, kami dapat memproses informasi
            yang Anda berikan, seperti nama, alamat email, nomor telepon, alamat
            pengiriman, rincian pesanan, dan bukti pembayaran yang Anda unggah.
            Situs juga menggunakan Google Analytics untuk memahami penggunaan
            situs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Tujuan penggunaan</h2>
          <p>Informasi digunakan untuk:</p>
          <ul className="list-disc pl-6">
            <li>membuat dan mengelola akun pelanggan;</li>
            <li>memproses pesanan, pembayaran, dan pengiriman;</li>
            <li>mengirim pembaruan pesanan dan menjawab permintaan bantuan; serta</li>
            <li>memahami penggunaan situs dan menjaga keamanan layanan.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Layanan pihak ketiga</h2>
          <p>
            Untuk menjalankan fitur toko, informasi yang diperlukan dapat
            diproses oleh penyedia layanan yang terhubung dengan situs, termasuk
            Firebase untuk akun dan data toko, Midtrans untuk pembayaran,
            Biteship untuk pengiriman, Resend untuk email, Fonnte untuk pesan
            WhatsApp, Cloudinary untuk berkas gambar, dan Google Analytics untuk
            analitik. Masing-masing penyedia memiliki kebijakan privasinya
            sendiri.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Penyimpanan dan keamanan</h2>
          <p>
            Kami menyimpan informasi selama diperlukan untuk mengelola akun,
            pesanan, dukungan pelanggan, keamanan, dan kewajiban yang berlaku.
            Kami menerapkan langkah yang wajar untuk melindungi informasi, namun
            pengiriman atau penyimpanan data melalui internet tidak dapat
            dijamin sepenuhnya aman.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Permintaan terkait data</h2>
          <p>
            Anda dapat menghubungi kami untuk meminta akses, koreksi, atau
            penghapusan informasi pribadi. Permintaan dapat dibatasi apabila
            informasi masih diperlukan untuk menyelesaikan pesanan atau memenuhi
            kewajiban yang berlaku.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Perubahan dan kontak</h2>
          <p>
            Kebijakan ini dapat diperbarui dengan menerbitkan versi terbaru pada
            halaman ini. Untuk pertanyaan atau permintaan terkait privasi, hubungi
            <a className="underline ml-1" href="mailto:khairashop25@gmail.com">khairashop25@gmail.com</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
