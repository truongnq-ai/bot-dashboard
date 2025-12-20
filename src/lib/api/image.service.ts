/**
 * Image Upload Service
 * 
 * All image uploads go through Core Service API, not directly to Cloudinary.
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { ImageUploadResponse, ImageUploadResponseData } from '../../types/image';
import { ResponseObject } from '../../types/common';

/**
 * Upload image to Core Service
 * 
 * @param file Image file to upload
 * @param category Image category ('practice', 'avatar', 'tutor-mode', etc.)
 * @param metadata Optional metadata (e.g., questionId for practice category)
 */
export async function uploadImage(
  file: File,
  category: string,
  metadata?: Record<string, string>
): Promise<ResponseObject<ImageUploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }
  
  const response = await apiClient.post<ImageUploadResponseData>(
    API_ENDPOINTS.IMAGES_UPLOAD,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Image upload failed');
  }
  
  return {
    errorCode: response.data.errorCode,
    errorDetail: response.data.errorDetail,
    data: response.data.data,
  };
}

/**
 * Delete image from Cloudinary
 * 
 * @param publicId Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<ResponseObject<void>> {
  const response = await apiClient.delete<ResponseObject<void>>(
    API_ENDPOINTS.IMAGES_DELETE(publicId)
  );
  
  if (response.data.errorCode !== '0000') {
    throw new Error(response.data.errorDetail || 'Image deletion failed');
  }
  
  return response.data;
}
