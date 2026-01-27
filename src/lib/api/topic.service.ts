/**
 * Topic API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Topic,
  CreateTopicRequest,
  UpdateTopicRequest,
  TopicListResponse,
  TopicResponse,
} from '@/types/topic';
import { ResponseObject } from '@/types/common';

/**
 * Get all topics (flat list)
 * @param subjectId Optional subject ID to filter by
 */
export async function getAllTopics(subjectId?: string, search?: string): Promise<ResponseObject<Topic[]>> {
  const params: any = {};
  if (subjectId) params.subjectId = subjectId;
  if (search) params.search = search;

  const response = await apiClient.get<TopicListResponse>(API_ENDPOINTS.TOPICS_LIST, { params });

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get topic by ID
 */
export async function getTopicById(id: string): Promise<ResponseObject<Topic>> {
  const response = await apiClient.get<TopicResponse>(API_ENDPOINTS.TOPICS_GET(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new topic
 */
export async function createTopic(data: CreateTopicRequest): Promise<ResponseObject<Topic>> {
  const response = await apiClient.post<TopicResponse>(API_ENDPOINTS.TOPICS_CREATE, data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update topic
 */
export async function updateTopic(
  id: string,
  data: UpdateTopicRequest
): Promise<ResponseObject<Topic>> {
  const response = await apiClient.put<TopicResponse>(API_ENDPOINTS.TOPICS_UPDATE(id), data);

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Delete topic (hard delete, cascade)
 */
export async function deleteTopic(id: string): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(API_ENDPOINTS.TOPICS_DELETE(id));

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

