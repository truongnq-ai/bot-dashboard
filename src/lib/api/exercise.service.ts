/**
 * Exercise Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Exercise,
  CreateExerciseRequest,
  UpdateExerciseRequest,
  ReviewExerciseRequest,
  ExerciseSearchParams,
  ExerciseListResponseData,
  ExerciseResponse,
  ExerciseStatsResponse,
  ExerciseReviewLog,
} from '../../types/exercise';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get exercises list with filters and pagination
 */
export async function getExercises(
  params: ExerciseSearchParams = {}
): Promise<ResponseObject<PageResponse<Exercise>>> {
  const queryParams = new URLSearchParams();
  
  if (params.skillId) queryParams.append('skillId', params.skillId);
  if (params.grade) queryParams.append('grade', params.grade.toString());
  if (params.reviewStatus) queryParams.append('reviewStatus', params.reviewStatus);
  if (params.difficultyLevel) queryParams.append('difficultyLevel', params.difficultyLevel.toString());
  if (params.searchText) queryParams.append('searchText', params.searchText);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  
  const response = await apiClient.get<ExerciseListResponseData>(
    `${API_ENDPOINTS.EXERCISES_LIST}?${queryParams.toString()}`
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercises');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(id: string): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.get<ExerciseResponse>(API_ENDPOINTS.EXERCISES_GET(id));
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercise');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new exercise
 */
export async function createExercise(
  data: CreateExerciseRequest
): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.post<ExerciseResponse>(
    API_ENDPOINTS.EXERCISES_CREATE,
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to create exercise');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update exercise
 */
export async function updateExercise(
  id: string,
  data: UpdateExerciseRequest
): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.put<ExerciseResponse>(
    API_ENDPOINTS.EXERCISES_UPDATE(id),
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to update exercise');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Delete exercise
 */
export async function deleteExercise(id: string): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(
    API_ENDPOINTS.EXERCISES_DELETE(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to delete exercise');
  }
  
  return response.data;
}

/**
 * Get exercises by skill
 */
export async function getExercisesBySkill(
  skillId: string
): Promise<ResponseObject<PageResponse<Exercise>>> {
  const response = await apiClient.get<ExerciseListResponseData>(
    API_ENDPOINTS.EXERCISES_BY_SKILL(skillId)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercises by skill');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get exercise statistics
 */
export async function getExerciseStats(
  id: string
): Promise<ResponseObject<ExerciseStatsResponse>> {
  const response = await apiClient.get<ResponseObject<ExerciseStatsResponse>>(
    API_ENDPOINTS.EXERCISES_STATS(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch exercise stats');
  }
  
  return response.data;
}

/**
 * Review exercise (approve/reject/needs-revision)
 */
export async function reviewExercise(
  id: string,
  data: ReviewExerciseRequest
): Promise<ResponseObject<Exercise>> {
  const response = await apiClient.post<ExerciseResponse>(
    API_ENDPOINTS.EXERCISES_REVIEW(id),
    data
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to review exercise');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get review history for exercise
 */
export async function getReviewHistory(
  id: string
): Promise<ResponseObject<ExerciseReviewLog[]>> {
  const response = await apiClient.get<ResponseObject<ExerciseReviewLog[]>>(
    API_ENDPOINTS.EXERCISES_REVIEW_HISTORY(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch review history');
  }
  
  return response.data;
}
