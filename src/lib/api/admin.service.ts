/**
 * Admin Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Admin,
  AdminSearchParams,
  AdminRegistrationRequest,
  UpdateAdminStatusRequest,
  AdminListResponse,
  AdminResponse,
} from '../../types/admin';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get admins list with filters and pagination
 */
export async function getAdmins(
  params: AdminSearchParams = {}
): Promise<ResponseObject<PageResponse<Admin>>> {
  const queryParams = new URLSearchParams();

  if (params.searchText) queryParams.append('searchText', params.searchText);
  if (params.status) queryParams.append('status', params.status);
  if (params.role) queryParams.append('role', params.role);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

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
 * Update admin status
 */
export async function updateAdminStatus(
  id: string,
  status: UpdateAdminStatusRequest['status']
): Promise<ResponseObject<Admin>> {
  const response = await apiClient.put<AdminResponse>(API_ENDPOINTS.ADMINS_UPDATE_STATUS(id), {
    status,
  });

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

