import { adminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/types/product";

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const snapshot = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    price: data.price,
    image: data.image,
    images: data.images ?? [],
    description: data.description,
    variants: data.variants ?? [],
    weight: data.weight,
    length: data.length,
    width: data.width,
    height: data.height,
    rating: data.rating,
    reviewCount: data.reviewCount,
    category: data.category,
  };
}