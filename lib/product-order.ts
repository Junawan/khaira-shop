type OrderedProduct = {
  displayOrder?: number;
};

export function sortByDisplayOrder<T extends OrderedProduct>(products: T[]): T[] {
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      const aOrder = Number.isFinite(a.product.displayOrder)
        ? a.product.displayOrder!
        : Number.POSITIVE_INFINITY;
      const bOrder = Number.isFinite(b.product.displayOrder)
        ? b.product.displayOrder!
        : Number.POSITIVE_INFINITY;

      return aOrder - bOrder || a.index - b.index;
    })
    .map(({ product }) => product);
}
