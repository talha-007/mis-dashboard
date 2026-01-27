/**
 * Base API Service
 * Generic service class for CRUD operations
 */

import type { AxiosRequestConfig } from 'axios';

import axiosInstance from './axios-instance';

import type { ApiResponse, PaginatedResponse } from './types';

export class BaseApiService<T = any> {
  constructor(protected endpoint: string) {}

  /**
   * GET - Fetch all items
   */
  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response = await axiosInstance.get<ApiResponse<T[]>>(this.endpoint, { params });
    return response.data.data;
  }

  /**
   * GET - Fetch paginated items
   */
  async getPaginated(
    page: number = 1,
    limit: number = 10,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<T>>>(this.endpoint, {
      params: { page, limit, ...params },
    });
    return response.data.data;
  }

  /**
   * GET - Fetch single item by ID
   */
  async getById(id: string | number): Promise<T> {
    const response = await axiosInstance.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
    return response.data.data;
  }

  /**
   * POST - Create new item
   */
  async create(data: Partial<T>, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<ApiResponse<T>>(this.endpoint, data, config);
    return response.data.data;
  }

  /**
   * PUT - Update item by ID
   */
  async update(id: string | number, data: Partial<T>, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<ApiResponse<T>>(
      `${this.endpoint}/${id}`,
      data,
      config
    );
    return response.data.data;
  }

  /**
   * PATCH - Partially update item by ID
   */
  async patch(id: string | number, data: Partial<T>, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<ApiResponse<T>>(
      `${this.endpoint}/${id}`,
      data,
      config
    );
    return response.data.data;
  }

  /**
   * DELETE - Delete item by ID
   */
  async delete(id: string | number): Promise<void> {
    await axiosInstance.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Custom request for non-standard operations
   */
  async request<R = any>(config: AxiosRequestConfig): Promise<R> {
    const response = await axiosInstance.request<ApiResponse<R>>(config);
    return response.data.data;
  }
}
