/**
 * Statistics API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  ExerciseStats,
  ExerciseStatsRequest,
  ExerciseStatsResponse,
} from '@/types/exercise';
import { ResponseObject } from '@/types/common';

/**
 * Get exercise statistics
 */
export async function getExerciseStats(
  params: ExerciseStatsRequest
): Promise<ResponseObject<ExerciseStats[]>> {
  const response = await apiClient.get<ExerciseStatsResponse>(API_ENDPOINTS.EXERCISES_STATS, {
    params,
  });

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}
