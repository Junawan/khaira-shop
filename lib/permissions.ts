export const permissions = {
  super_admin: [
    "dashboard",
    "products",
    "orders",
    "analytics",
    "settings",
    "admins",
    "delete_product",
    "delete_order",
  ],

  admin: [
    "dashboard",
    "products",
    "orders",
    "analytics",
  ],

  staff: [
    "dashboard",
    "orders",
  ],
};

export function hasPermission(
  role: string,
  permission: string
) {
  return permissions[
    role as keyof typeof permissions
  ]?.includes(permission);
}