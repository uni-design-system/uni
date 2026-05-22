import { Injectable } from '@angular/core';
import { Permission } from './permission.types';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  async getPermissionState(permission: Permission) {
    try {
      const { state } = await navigator.permissions.query({
        name: permission as PermissionName,
      });
      return state;
    } catch (error) {
      return 'unsupported';
    }
  }

  async isAllowed(permission: Permission) {
    try {
      const { state } = await navigator.permissions.query({
        name: permission as PermissionName,
      });
      return state === 'granted' || state === 'prompt';
    } catch (error) {
      return false;
    }
  }
}
