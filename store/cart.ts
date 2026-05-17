import { create } from "zustand";

import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;

  name: string;

  price: number;

  image?: string;

  quantity: number;

  weight?: number;

  length?: number;

  width?: number;

  height?: number;
};

type CartStore = {
  cart: CartItem[];

  addToCart: (
    product: CartItem
  ) => void;

  removeFromCart: (
    id: string,
    name: string
  ) => void;

  clearCart: () => void;
};

export const useCartStore =
  create<CartStore>()(
    persist(
      (set) => ({
        cart: [],

        addToCart: (product) =>
          set((state) => {
            const existing =
              state.cart.find(
                (item) =>
                  item.id ===
                    product.id &&
                  item.name ===
                    product.name
              );

            if (existing) {
              return {
                cart: state.cart.map(
                  (item) =>
                    item.id ===
                      product.id &&
                    item.name ===
                      product.name
                      ? {
                          ...item,

                          quantity:
                            item.quantity +
                            product.quantity,
                        }
                      : item
                ),
              };
            }

            return {
              cart: [
                ...state.cart,
                product,
              ],
            };
          }),

        removeFromCart: (
          id,
          name
        ) =>
          set((state) => ({
            cart:
              state.cart.filter(
                (item) =>
                  !(
                    item.id === id &&
                    item.name ===
                      name
                  )
              ),
          })),

        clearCart: () =>
          set({
            cart: [],
          }),
      }),
      {
        name: "khairashop-cart",
      }
    )
  );