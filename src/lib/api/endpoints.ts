/**
 * API Endpoints Constants
 */

// API Version prefix - centralized for easy maintenance
const API_VERSION = '/api/v1';

export const API_ENDPOINTS = {
  // Authentication
  ADMIN_LOGIN: `${API_VERSION}/admin/login`,
  AUTH_REFRESH_TOKEN: `${API_VERSION}/auth/refresh_token`,
  AUTH_LOGOUT: `${API_VERSION}/auth/logout`,

  // Exercises
  EXERCISES_LIST: `${API_VERSION}/admin/exercises`,
  EXERCISES_CREATE: `${API_VERSION}/admin/exercises`,
  EXERCISES_GET: (id: string) => `${API_VERSION}/admin/exercises/${id}`,
  EXERCISES_UPDATE: (id: string) => `${API_VERSION}/admin/exercises/${id}`,
  EXERCISES_DELETE: (id: string) => `${API_VERSION}/admin/exercises/${id}`,
  EXERCISES_BY_SKILL: (skillId: string) => `${API_VERSION}/admin/exercises/by-skill/${skillId}`,
  EXERCISES_STATS: (id: string) => `${API_VERSION}/admin/exercises/${id}/stats`,
  EXERCISES_REVIEW: (id: string) => `${API_VERSION}/admin/exercises/${id}/review`,
  EXERCISES_REVIEW_HISTORY: (id: string) => `${API_VERSION}/admin/exercises/${id}/review-history`,

  // Skills
  SKILLS_LIST: `${API_VERSION}/admin/skills`,

  // Images
  IMAGES_UPLOAD: `${API_VERSION}/images/upload`,
  IMAGES_DELETE: (publicId: string) => `${API_VERSION}/images/${publicId}`,
} as const;
