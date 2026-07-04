/**
 * Utility functions for Role-Based Access Control
 */

/**
 * Checks if a user has a specific permission based on their permissions list.
 * 
 * @param userPermissions List of permissions the user has, formatted as "resource:action"
 * @param resource The resource to check (e.g. "users", "schedules")
 * @param action The action to check (e.g. "read", "create")
 * @returns boolean true if user has the permission
 */
export function hasPermission(
  userPermissions: string[],
  resource: string,
  action: string
): boolean {
  return userPermissions.includes(`${resource}:${action}`);
}

/**
 * Checks if a user has ANY of the specified permissions.
 */
export function hasAnyPermission(
  userPermissions: string[],
  permissions: { resource: string; action: string }[]
): boolean {
  return permissions.some((p) => hasPermission(userPermissions, p.resource, p.action));
}

/**
 * Checks if a user has ALL of the specified permissions.
 */
export function hasAllPermissions(
  userPermissions: string[],
  permissions: { resource: string; action: string }[]
): boolean {
  return permissions.every((p) => hasPermission(userPermissions, p.resource, p.action));
}
