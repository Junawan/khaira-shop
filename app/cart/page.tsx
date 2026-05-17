"use client";

import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
console.log("CART:", cart);
  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  );

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#faf7f2] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">
          Keranjang Belanja
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <p className="text-gray-600">
              Keranjang masih kosong
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Item */}
            <div className="md:col-span-2 space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id + item.name}
                  className="bg-white rounded-3xl p-5 flex gap-5 items-center shadow-sm"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 h-28 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-gray-200 rounded-2xl"></div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-gray-600">
                      Rp{item.price.toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(
  item.id,
  item.name
)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-xl"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm h-fit">
              <h2 className="text-2xl font-bold mb-6">
                Ringkasan
              </h2>

              <div className="flex justify-between mb-4">
                <span>Total</span>

                <span className="font-semibold">
                  Rp{totalPrice.toLocaleString()}
                </span>
              </div>

              <a href="/checkout">
  <button className="w-full bg-black text-white py-4 rounded-xl hover:opacity-90 transition">
    Checkout
  </button>
</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}