import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from './app-config';

@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).api;

  getAll(): Observable<string[]> {
    return this.http.get<{ tags: string[] }>(`${this.api}/tags`).pipe(map((res) => res.tags));
  }
}
