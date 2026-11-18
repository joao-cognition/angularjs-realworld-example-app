import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AppConstants } from './app.constants';

@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<string[]> {
    return this.http.get<{ tags: string[] }>(`${AppConstants.api}/tags`).pipe(map((r) => r.tags));
  }
}
