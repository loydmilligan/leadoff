/**
 * API Client
 * Centralized HTTP client with error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ApiError {
  error: string
  message: string
  details?: unknown
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          // Server responded with error status
          const apiError: ApiError = {
            error: error.response.data?.error || 'UNKNOWN_ERROR',
            message: error.response.data?.message || 'An error occurred',
            details: error.response.data?.details,
          }
          return Promise.reject(apiError)
        } else if (error.request) {
          // Request made but no response
          return Promise.reject({
            error: 'NETWORK_ERROR',
            message: 'Unable to reach server. Please check your connection.',
          })
        } else {
          // Error in request configuration
          return Promise.reject({
            error: 'REQUEST_ERROR',
            message: error.message,
          })
        }
      }
    )
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data)
    return response.data
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url)
    return response.data
  }
}

export const api = new ApiClient()
export default api
