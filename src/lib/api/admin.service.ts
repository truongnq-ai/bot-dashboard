/**
 * Admin Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Admin,
  AdminSearchParams,
  AdminRegistrationRequest,
  AdminListResponse,
  AdminResponse,
} from '../../types/admin';
import { ResponseObject, PageResponse, ResetPasswordResponse } from '../../types/common';

/**
 * Get admins list with filters and pagination
 */
export async function getAdmins(
  params: AdminSearchParams = {}
): Promise<ResponseObject<PageResponse<Admin>>> {
  const queryParams = new URLSearchParams();

  if (params.role) queryParams.append('role', params.role);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('size', params.pageSize.toString());

  const response = await apiClient.get<AdminListResponse>(
    `${API_ENDPOINTS.ADMINS_LIST}?${queryParams.toString()}`
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: string): Promise<ResponseObject<Admin>> {
  const response = await apiClient.get<AdminResponse>(API_ENDPOINTS.ADMINS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new admin
 */
export async function createAdmin(
  data: AdminRegistrationRequest
): Promise<ResponseObject<Admin>> {
  const response = await apiClient.post<AdminResponse>(API_ENDPOINTS.ADMINS_CREATE, data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Reset user password
 */
export async function resetUserPassword(
  id: string
): Promise<ResponseObject<ResetPasswordResponse>> {
  const response = await apiClient.post<ResponseObject<ResetPasswordResponse>>(
    API_ENDPOINTS.USERS_RESET_PASSWORD(id)
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}


