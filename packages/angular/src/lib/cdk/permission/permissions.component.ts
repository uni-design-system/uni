import { Component, inject, signal } from '@angular/core';
import {
  UniBadgeComponent,
  UniBoxComponent,
  UniRowComponent,
  UniStackComponent,
  UniTextComponent,
} from '../../components';
import { PermissionService } from './permission.service';
import type { Permission } from './permission.types';
import type { Variant } from '@uni-design-system/uni-core';

@Component({
  selector: 'uni-permissions-story-component, permissions-story-component',
  template: ` <div
    box-layout
    padding="sm"
    border="quaternary"
    borderRadius="sm"
    display="inline-block"
  >
    <div stack-layout gap="sm">
      @for (result of permissionTestResults(); track result.name) {
        <div row-layout gap="sm" alignItems="center">
          <div box-layout [width]="220" justifyContent="right" alignItems="center" display="flex">
            <Text display="block" align="right">{{ result.name }}:</Text>
          </div>
          <Badge [color]="result.colorToken" [width]="140">{{ result.state }}</Badge>
        </div>
      }
    </div>
  </div>`,
  standalone: true,
  imports: [
    UniStackComponent,
    UniBoxComponent,
    UniRowComponent,
    UniTextComponent,
    UniBadgeComponent,
  ],
})
export class PermissionsStoryComponent {
  permissionService = inject(PermissionService);

  permissions: Permission[] = [
    'accelerometer',
    'ambient-light-sensor',
    'background-fetch',
    'background-sync',
    'bluetooth',
    'camera',
    'clipboard-read',
    'clipboard-write',
    'compute-pressure',
    'device-info',
    'display-capture',
    'geolocation',
    'gyroscope',
    'local-fonts',
    'magnetometer',
    'microphone',
    'midi',
    'nfc',
    'notifications',
    'payment-handler',
    'persistent-storage',
    'push',
    'screen-wake-lock',
    'speaker',
    'storage-access',
    'top-level-storage-access',
    'window-management',
  ];
  permissionTestResults = signal<
    {
      name: string;
      state: string;
      colorToken: Variant;
    }[]
  >([]);

  permissionColorTokens: Record<PermissionState | 'unsupported', Variant> = {
    granted: 'secondary',
    denied: 'warn',
    prompt: 'primary',
    unsupported: 'disabled',
  };

  constructor() {
    this.loadPermissions().then(() => console.log(this.permissionTestResults()));
  }

  private async loadPermissions() {
    const results: {
      name: string;
      state: string;
      colorToken: Variant;
    }[] = [];

    for (const name of this.permissions) {
      try {
        const state = await this.permissionService.getPermissionState(name);
        results.push({
          name,
          state,
          colorToken: this.permissionColorTokens[state],
        });
      } catch {
        results.push({
          name,
          state: 'unsupported',
          colorToken: this.permissionColorTokens['unsupported'],
        });
      }
    }

    this.permissionTestResults.set(results);
  }
}
