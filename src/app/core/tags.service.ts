import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from './app.constants';

@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONSTANTS).api;

  getAll(): Observable<string[]> {
    return this.http.get<{ tags: string[] }>(`${this.api}/tags`).pipe(map((res) => res.tags));
  }
}
