import { adminDb } from "@/lib/firebase-admin";
import { createProductSlug } from "@/lib/product-slug";
import { Product } from "@/lib/types/product";

function toProduct(id: string, data: FirebaseFirestore.DocumentData): Product {
  const name = typeof data.name === "string" ? data.name : "";
  const storedSlug = typeof data.slug === "string" ? data.slug.trim() : "";

  return {
    id,
    slug: storedSlug || createProductSlug(name, id),
    name,
    price: data.price,
    image: data.image,
    images: data.image ? [data.image] : data.images ?? [],
    description: data.description,
    variants: data.variants ?? [],
    weight: data.weight,
    length: data.length,
    width: data.width,
    height: data.height,
    rating: data.rating,
    reviewCount: data.reviewCount,
    category: data.category,
    stock: typeof data.stock === "number" ? data.stock : undefined,
    active: true,
  };
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const snapshot = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const productDoc = snapshot.docs[0];
    const data = productDoc.data();
    if (data.active !== true) return null;
    return toProduct(productDoc.id, data);
  }

  // Older admin-created products may not have a stored slug. Their public
  // fallback URL ends with the Firestore ID so we can resolve it safely.
  const documentId = slug.slice(slug.lastIndexOf("-") + 1);
  if (documentId.length !== 20) return null;

  const productDoc = await adminDb.collection("products").doc(documentId).get();
  if (!productDoc.exists) return null;

  const data = productDoc.data()!;
  if (data.active !== true || (typeof data.slug === "string" && data.slug.trim())) {
    return null;
  }

  const product = toProduct(productDoc.id, data);
  return product.slug === slug ? product : null;
}
