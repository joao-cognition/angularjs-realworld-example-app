import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';

type Params = Record<string, string | number | boolean | undefined>;

/** Thin wrapper over HttpClient that targets the RealWorld API. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params: Params = {}): Observable<T> {
    return this.http.get<T>(`${API_URL}${path}`, { params: toHttpParams(params) });
  }

  post<T>(path: string, body: object = {}): Observable<T> {
    return this.http.post<T>(`${API_URL}${path}`, body);
  }

  put<T>(path: string, body: object = {}): Observable<T> {
    return this.http.put<T>(`${API_URL}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_URL}${path}`);
  }
}

function toHttpParams(params: Params): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') httpParams = httpParams.set(key, String(value));
  }
  return httpParams;
}
