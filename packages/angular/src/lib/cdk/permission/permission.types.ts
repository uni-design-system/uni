// https://developer.mozilla.org/en-US/docs/Web/API/Permissions

export type Permission =
  | 'accelerometer'
  | 'ambient-light-sensor'
  | 'background-fetch'
  | 'background-sync'
  | 'bluetooth'
  | 'camera'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'compute-pressure'
  | 'device-info'
  | 'display-capture'
  | 'geolocation'
  | 'gyroscope'
  | 'local-fonts'
  | 'magnetometer'
  | 'microphone'
  | 'midi'
  | 'nfc'
  | 'notifications'
  | 'payment-handler'
  | 'persistent-storage'
  | 'push'
  | 'screen-wake-lock'
  | 'speaker'
  | 'storage-access'
  | 'top-level-storage-access'
  | 'window-management';

export type PermissionState = 'granted' | 'prompt' | 'denied' | 'unsupported';
