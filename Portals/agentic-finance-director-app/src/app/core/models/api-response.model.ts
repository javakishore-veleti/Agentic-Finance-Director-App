/**
 * Matches the backend ApiResponse[T] wrapper:
 *   { success: bool, data: T, message?: str, errors?: list }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
}
