import type { Permission, PermissionState } from './permission.types';

/**
 * The current state of a browser permission. Resolves `unsupported` — never
 * rejects — where the Permissions API is missing or does not know the name,
 * which is the norm rather than the exception: Firefox and Safari reject
 * `clipboard-write`, for one. Treat `unsupported` as "can't tell", not "no".
 */
export async function queryPermission(permission: Permission): Promise<PermissionState> {
  try {
    const { state } = await navigator.permissions.query({ name: permission as PermissionName });
    return state;
  } catch {
    return 'unsupported';
  }
}
