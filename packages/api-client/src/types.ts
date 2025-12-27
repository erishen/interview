/**
 * API Client Types
 * Framework-agnostic types for API operations
 */

export interface ApiClientOptions {
  baseUrl?: string
  timeout?: number
  headers?: Record<string, string>
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
  timeout?: number
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string | string[]>
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

/**
 * FastAPI specific options
 */
export interface FastApiOptions extends ApiClientOptions {
  enableRedirectHandling?: boolean
  strictHeaders?: boolean
  cookieString?: string  // Cookie string for server-side cookie forwarding
}

/**
 * URL building options for FastAPI
 */
export interface FastApiUrlOptions {
  includeQueryParams?: boolean
  request?: {
    nextUrl?: {
      search: string
    }
  }
}
