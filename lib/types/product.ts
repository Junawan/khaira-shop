export type Product = {
  id: string;

  slug?: string;

  name: string;

  price: number;

  image?: string;

  images?: string[];

  description?: string;

  variants?: {
    name: string;
    values: {
      value: string;
      price: number;
    }[];
  }[];

  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  rating?: number;
  reviewCount?: number;
  category?: string;
};