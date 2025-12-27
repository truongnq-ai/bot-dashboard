/**
 * Device Service
 */
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { Device, DeviceListResponse } from '../../types/device';

/**
 * Get devices for a user
 */
export async function getDevicesByUserId(userId: string): Promise<DeviceListResponse> {
  const response = await apiClient.get<DeviceListResponse>(
    API_ENDPOINTS.DEVICES_BY_USER(userId)
  );
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

