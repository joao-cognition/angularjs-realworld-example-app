import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from './app-config';
import { Profile } from './models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).api;

  get(username: string): Observable<Profile> {
    return this.http
      .get<{ profile: Profile }>(`${this.api}/profiles/${username}`)
      .pipe(map((res) => res.profile));
  }

  follow(username: string): Observable<Profile> {
    return this.http
      .post<{ profile: Profile }>(`${this.api}/profiles/${username}/follow`, {})
      .pipe(map((res) => res.profile));
  }

  unfollow(username: string): Observable<Profile> {
    return this.http
      .delete<{ profile: Profile }>(`${this.api}/profiles/${username}/follow`)
      .pipe(map((res) => res.profile));
  }
}
