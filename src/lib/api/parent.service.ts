/**
 * Parent Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Parent,
  ParentSearchParams,
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

  queryParams.append('role', 'PARENT');
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('size', params.pageSize.toString());

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


