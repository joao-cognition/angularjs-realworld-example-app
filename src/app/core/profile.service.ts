import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConstants } from './app.constants';
import { Profile } from './models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  get(username: string): Observable<Profile> {
    return this.http
      .get<{ profile: Profile }>(`${AppConstants.api}/profiles/${username}`)
      .pipe(map((res) => res.profile));
  }

  follow(username: string): Observable<Profile> {
    return this.http
      .post<{ profile: Profile }>(`${AppConstants.api}/profiles/${username}/follow`, {})
      .pipe(map((res) => res.profile));
  }

  unfollow(username: string): Observable<Profile> {
    return this.http
      .delete<{ profile: Profile }>(`${AppConstants.api}/profiles/${username}/follow`)
      .pipe(map((res) => res.profile));
  }
}
