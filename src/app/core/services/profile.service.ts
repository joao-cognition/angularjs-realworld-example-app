import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Profile } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  get(username: string): Observable<Profile> {
    return this.api.get<{ profile: Profile }>(`/profiles/${username}`).pipe(map((r) => r.profile));
  }

  follow(username: string): Observable<Profile> {
    return this.api
      .post<{ profile: Profile }>(`/profiles/${username}/follow`)
      .pipe(map((r) => r.profile));
  }

  unfollow(username: string): Observable<Profile> {
    return this.api
      .delete<{ profile: Profile }>(`/profiles/${username}/follow`)
      .pipe(map((r) => r.profile));
  }
}
