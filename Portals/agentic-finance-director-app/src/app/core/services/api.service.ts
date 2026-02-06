import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET with automatic ApiResponse unwrap → returns just `data`
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http
      .get<ApiResponse<T>>(`${this.base}${endpoint}`, { params: httpParams })
      .pipe(map(r => r.data));
  }

  /**
   * GET raw — returns full ApiResponse (useful when you need message/errors)
   */
  getRaw<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.base}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${endpoint}`, body)
      .pipe(map(r => r.data));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${endpoint}`, body)
      .pipe(map(r => r.data));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.base}${endpoint}`, body)
      .pipe(map(r => r.data));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${endpoint}`)
      .pipe(map(r => r.data));
  }
}
