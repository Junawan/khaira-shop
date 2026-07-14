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

  return {
    id: doc.id,
    ...(doc.data() as Omit<Product, "id">),
  };
}