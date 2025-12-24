/**
 * 通用 API 类型定义
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

import { UserRole } from '../constants'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in?: number
}

// Legacy pagination params (for backward compatibility with @interview/types)
export interface LegacyPaginationParams {
  page: number
  limit: number
}

// Legacy paginated response (for backward compatibility with @interview/types)
export interface LegacyPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
