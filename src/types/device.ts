export interface Device {
  id: string;
  deviceId: string;
  platform: string | null;
  model: string | null;
  osVersion: string | null;
  isFromTrial: boolean;
  isFromLicense: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DeviceListResponse = import('./common').ResponseObject<Device[]>;

