/**
 * API-related types and interfaces
 */

/**
 * Base API response structure
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  status: number;
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

/**
 * Generic query parameters for API requests
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
  include?: string[];
}

/**
 * File upload response
 */
export interface FileUploadResponse
  extends ApiResponse<{
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }> {}
