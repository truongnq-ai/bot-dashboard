/**
 * Prompt Template Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  PromptTemplate,
  PromptTemplateSearchParams,
  PromptTemplateListResponseData,
  PromptTemplateResponse,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
} from '../../types/prompt-template';
import { ResponseObject, PageResponse } from '../../types/common';

/**
 * Get prompt templates list with filters and pagination
 */
export async function getPromptTemplates(
  params: PromptTemplateSearchParams = {}
): Promise<ResponseObject<PageResponse<PromptTemplate>>> {
  const queryParams = new URLSearchParams();

  if (params.name) queryParams.append('name', params.name);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  const response = await apiClient.get<PromptTemplateListResponseData>(
    `${API_ENDPOINTS.PROMPT_TEMPLATES_LIST}?${queryParams.toString()}`
  );

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch prompt templates');
  }

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get prompt template by ID
 */
export async function getPromptTemplateById(id: string): Promise<ResponseObject<PromptTemplate>> {
  const response = await apiClient.get<PromptTemplateResponse>(API_ENDPOINTS.PROMPT_TEMPLATES_GET(id));

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch prompt template');
  }

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Create new prompt template
 */
export async function createPromptTemplate(
  data: CreatePromptTemplateRequest
): Promise<ResponseObject<PromptTemplate>> {
  const response = await apiClient.post<PromptTemplateResponse>(
    API_ENDPOINTS.PROMPT_TEMPLATES_CREATE,
    data
  );

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to create prompt template');
  }

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Update prompt template
 */
export async function updatePromptTemplate(
  id: string,
  data: UpdatePromptTemplateRequest
): Promise<ResponseObject<PromptTemplate>> {
  const response = await apiClient.put<PromptTemplateResponse>(
    API_ENDPOINTS.PROMPT_TEMPLATES_UPDATE(id),
    data
  );

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to update prompt template');
  }

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Delete prompt template
 */
export async function deletePromptTemplate(id: string): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(
    API_ENDPOINTS.PROMPT_TEMPLATES_DELETE(id)
  );

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to delete prompt template');
  }

  return response.data;
}

/**
 * Activate prompt template
 */
export async function activatePromptTemplate(id: string): Promise<ResponseObject<PromptTemplate>> {
  const response = await apiClient.post<PromptTemplateResponse>(
    API_ENDPOINTS.PROMPT_TEMPLATES_ACTIVATE(id)
  );

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to activate prompt template');
  }

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Deactivate prompt template
 */
export async function deactivatePromptTemplate(id: string): Promise<ResponseObject<PromptTemplate>> {
  const response = await apiClient.post<PromptTemplateResponse>(
    API_ENDPOINTS.PROMPT_TEMPLATES_DEACTIVATE(id)
  );

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to deactivate prompt template');
  }

  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Get active prompt templates
 */
export async function getActivePromptTemplates(): Promise<ResponseObject<PromptTemplate[]>> {
  const response = await apiClient.get<ResponseObject<PromptTemplate[]>>(
    API_ENDPOINTS.PROMPT_TEMPLATES_ACTIVE
  );

  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Failed to fetch active prompt templates');
  }

  return response.data;
}

