/**
 * Param Service — API calls cho System Params
 * CRUD: list, create, update (by id), delete (by id)
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export interface SystemParam {
  id: number;
  group: string;
  code: string;
  value: string;
  description?: string;
}

export interface ParamCreate {
  group: string;
  code: string;
  value: string;
  description?: string;
}

export interface ParamUpdate {
  value: string;
  description?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getParams(group?: string): Promise<{ count: number; params: SystemParam[] }> {
  const res = await apiClient.get(API_ENDPOINTS.PARAMS_LIST, {
    params: group ? { group } : undefined,
  });
  return res.data;
}

export async function createParam(data: ParamCreate): Promise<SystemParam> {
  const res = await apiClient.post(API_ENDPOINTS.PARAMS_CREATE, data);
  return res.data;
}

export async function updateParam(id: number, data: ParamUpdate): Promise<SystemParam> {
  const res = await apiClient.put(API_ENDPOINTS.PARAMS_UPDATE(id), data);
  return res.data;
}

export async function deleteParam(id: number): Promise<{ id: number; message: string }> {
  const res = await apiClient.delete(API_ENDPOINTS.PARAMS_DELETE(id));
  return res.data;
}
