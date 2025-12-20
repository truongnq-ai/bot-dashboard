/**
 * Image Upload Types
 */

import { ResponseObject } from './common';

// Image Upload Request
export interface ImageUploadRequest {
  file: File;
  category: string; // 'practice', 'avatar', 'tutor-mode', etc.
  metadata?: Record<string, string>;
}

// Image Upload Response
export interface ImageUploadResponse {
  imageUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  size?: number;
  expiresAt?: string;
  uploadedAt: string;
}

// API Response Types
export interface ImageUploadResponseData extends ResponseObject<ImageUploadResponse> {}
