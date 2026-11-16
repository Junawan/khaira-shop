/** Build a readable, stable product URL while keeping each product unique. */
export function createProductSlug(name: string, id: string): string {
  const nameSlug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${nameSlug || "produk"}-${id}`;
}
