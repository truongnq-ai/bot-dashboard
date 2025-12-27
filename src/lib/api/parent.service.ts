/**
 * Parent Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Parent,
  ParentSearchParams,
  UpdateParentStatusRequest,
  ParentListResponse,
  ParentResponse,
} from '../../types/parent';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get parents list with filters and pagination
 */
export async function getParents(
  params: ParentSearchParams = {}
): Promise<ResponseObject<PageResponse<Parent>>> {
  const queryParams = new URLSearchParams();

  if (params.searchText) queryParams.append('searchText', params.searchText);
  if (params.status) queryParams.append('status', params.status);
  if (params.phoneVerified !== undefined) queryParams.append('phoneVerified', params.phoneVerified.toString());
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

  const response = await apiClient.get<ParentListResponse>(
    `${API_ENDPOINTS.PARENTS_LIST}?${queryParams.toString()}`
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get parent by ID
 */
export async function getParentById(id: string): Promise<ResponseObject<Parent>> {
  const response = await apiClient.get<ParentResponse>(API_ENDPOINTS.PARENTS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update parent status
 */
export async function updateParentStatus(
  id: string,
  status: UpdateParentStatusRequest['status']
): Promise<ResponseObject<Parent>> {
  const response = await apiClient.put<ParentResponse>(API_ENDPOINTS.PARENTS_UPDATE_STATUS(id), {
    status,
  });

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

