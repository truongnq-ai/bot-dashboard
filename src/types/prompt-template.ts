/**
 * Prompt Template Types
 */

import { ResponseObject, PageResponse } from './common';

// Prompt Template Entity
export interface PromptTemplate {
  id: string;
  name: string;
  version: number;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormatSchema?: Record<string, any>;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// Search Params
export interface PromptTemplateSearchParams {
  name?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// Request DTOs
export interface CreatePromptTemplateRequest {
  name: string;
  version?: number;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormatSchema?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdatePromptTemplateRequest {
  version?: number;
  systemPrompt?: string;
  userPromptTemplate?: string;
  outputFormatSchema?: Record<string, any>;
  isActive?: boolean;
}

// Response DTOs
export interface PromptTemplateListResponse extends PageResponse<PromptTemplate> {}

export interface PromptTemplateResponse extends ResponseObject<PromptTemplate> {}

export interface PromptTemplateListResponseData extends ResponseObject<PromptTemplateListResponse> {}

