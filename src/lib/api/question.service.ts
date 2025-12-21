/**
 * Question Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Question,
  QuestionSearchParams,
  QuestionListResponseData,
  QuestionResponse,
  QuestionStatsResponse,
  PracticeResponse,
  GenerateQuestionRequest,
} from '../../types/question';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get questions list with filters and pagination
 */
export async function getQuestions(
  params: QuestionSearchParams = {}
): Promise<ResponseObject<PageResponse<Question>>> {
  const queryParams = new URLSearchParams();
  
  if (params.skillId) queryParams.append('skillId', params.skillId);
  if (params.exerciseId) queryParams.append('exerciseId', params.exerciseId);
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.status) queryParams.append('status', params.status);
  if (params.questionType) queryParams.append('questionType', params.questionType);
  if (params.searchText) queryParams.append('searchText', params.searchText);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  
  const response = await apiClient.get<QuestionListResponseData>(
    `${API_ENDPOINTS.QUESTIONS_LIST}?${queryParams.toString()}`
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch questions');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get question by ID
 */
export async function getQuestionById(id: string): Promise<ResponseObject<Question>> {
  const response = await apiClient.get<QuestionResponse>(API_ENDPOINTS.QUESTIONS_GET(id));
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch question');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get questions by exercise
 */
export async function getQuestionsByExercise(
  exerciseId: string
): Promise<ResponseObject<Question[]>> {
  const response = await apiClient.get<ResponseObject<Question[]>>(
    API_ENDPOINTS.QUESTIONS_BY_EXERCISE(exerciseId)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch questions');
  }
  
  return response.data;
}

/**
 * Get questions by skill
 */
export async function getQuestionsBySkill(
  skillId: string
): Promise<ResponseObject<Question[]>> {
  const response = await apiClient.get<ResponseObject<Question[]>>(
    API_ENDPOINTS.QUESTIONS_BY_SKILL(skillId)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch questions');
  }
  
  return response.data;
}

/**
 * Get question statistics
 */
export async function getQuestionStats(
  id: string
): Promise<ResponseObject<QuestionStatsResponse>> {
  const response = await apiClient.get<ResponseObject<QuestionStatsResponse>>(
    API_ENDPOINTS.QUESTIONS_STATS(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch question stats');
  }
  
  return response.data;
}

/**
 * Get practices for a question
 */
export async function getQuestionPractices(
  id: string
): Promise<ResponseObject<PracticeResponse[]>> {
  const response = await apiClient.get<ResponseObject<PracticeResponse[]>>(
    API_ENDPOINTS.QUESTIONS_PRACTICES(id)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch practices');
  }
  
  return response.data;
}

/**
 * Generate questions
 */
export async function generateQuestions(
  request: GenerateQuestionRequest
): Promise<ResponseObject<Question[]>> {
  const response = await apiClient.post<ResponseObject<Question[]>>(
    API_ENDPOINTS.QUESTIONS_GENERATE,
    request
  );
  
  // Return response directly, let caller handle error codes
  return response.data;
}

