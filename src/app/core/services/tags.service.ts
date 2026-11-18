import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly api = inject(ApiService);

  getAll(): Observable<string[]> {
    return this.api.get<{ tags: string[] }>('/tags').pipe(map((r) => r.tags));
  }
}
