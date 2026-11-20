export type Product = {
  id: string;

  active?: boolean;

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
      stock?: number;
    }[];
  }[];

  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  rating?: number;
  reviewCount?: number;
  ratingSum?: number;
  category?: string;
  stock?: number;
  displayOrder?: number;
};
