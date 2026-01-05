/**
 * Topic Types
 */

import { ResponseObject } from './common';

// Topic Entity
export interface Topic {
  id: string;
  subjectId: string;
  parentId?: string;
  name: string;
  description?: string;
  level?: number;
  orderIndex?: number;
  children?: Topic[]; // For tree structure
  createdAt: string;
  updatedAt?: string;
}

// Search Params (for client-side filtering)
export interface TopicSearchParams {
  subjectId?: string;
  name?: string;
}

// Request DTOs
export interface CreateTopicRequest {
  subjectId: string;
  parentId?: string;
  name: string;
  description?: string;
  orderIndex?: number;
}

export interface UpdateTopicRequest {
  name?: string;
  description?: string;
  parentId?: string;
  orderIndex?: number;
}

// Response DTOs
export interface TopicListResponse extends ResponseObject<Topic[]> {}

export interface TopicResponse extends ResponseObject<Topic> {}

