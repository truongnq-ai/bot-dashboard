/**
 * Trial Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Trial,
  TrialSearchParams,
  UpdateTrialStatusRequest,
  TrialListResponse,
  TrialResponse,
} from '../../types/trial';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get trials list with filters and pagination
 */
export async function getTrials(
  params: TrialSearchParams = {}
): Promise<ResponseObject<PageResponse<Trial>>> {
  const queryParams = new URLSearchParams();

  if (params.userId) queryParams.append('userId', params.userId);
  if (params.status) queryParams.append('status', params.status);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

  const response = await apiClient.get<TrialListResponse>(
    `${API_ENDPOINTS.TRIALS_LIST}?${queryParams.toString()}`
  );

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get trial by ID
 */
export async function getTrialById(id: string): Promise<ResponseObject<Trial>> {
  const response = await apiClient.get<TrialResponse>(API_ENDPOINTS.TRIALS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update trial status
 */
export async function updateTrialStatus(
  id: string,
  status: UpdateTrialStatusRequest['trialStatus']
): Promise<ResponseObject<Trial>> {
  const response = await apiClient.put<TrialResponse>(API_ENDPOINTS.TRIALS_UPDATE_STATUS(id), {
    trialStatus: status,
  });

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

