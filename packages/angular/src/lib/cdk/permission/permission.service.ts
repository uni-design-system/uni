import { Injectable } from '@angular/core';
import { queryPermission } from './permission';
import type { Permission, PermissionState } from './permission.types';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  getPermissionState(permission: Permission): Promise<PermissionState> {
    return queryPermission(permission);
  }

  async isAllowed(permission: Permission) {
    try {
      const { state } = await navigator.permissions.query({
        name: permission as PermissionName,
      });
      return state === 'granted' || state === 'prompt';
    } catch {
      return false;
    }
  }
}
