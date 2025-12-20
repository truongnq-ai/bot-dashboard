/**
 * Grade Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { ResponseObject } from '../../types/common';

/**
 * Get available grades list
 */
export async function getGrades(): Promise<ResponseObject<number[]>> {
  const response = await apiClient.get<ResponseObject<number[]>>(API_ENDPOINTS.GRADES_LIST);
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch grades');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

