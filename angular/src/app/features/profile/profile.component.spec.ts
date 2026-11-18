import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ArticlesService } from '../../core/articles.service';
import { Profile, User } from '../../core/models';
import { ProfileService } from '../../core/profile.service';
import { UserService } from '../../core/user.service';
import { profileListConfig } from './profile-articles.component';
import { PROFILE_ROUTES } from './profile.routes';

const bob: Profile = { username: 'bob', bio: 'bio of bob', image: 'b.png', following: false };

async function setup(current: Partial<User> | null) {
  const query = vi.fn(() => of({ articles: [], articlesCount: 0 }));
  const follow = vi.fn(() => of({ ...bob, following: true }));
  TestBed.configureTestingModule({
    providers: [
      provideRouter([...PROFILE_ROUTES, { path: '', children: [] }], withComponentInputBinding()),
      { provide: ProfileService, useValue: { get: () => of(bob), follow } },
      { provide: UserService, useValue: { current: signal(current) } },
      { provide: ArticlesService, useValue: { query } },
    ],
  });
  const harness = await RouterTestingHarness.create();
  return { harness, query, follow };
}

describe('ProfileComponent', () => {
  it("shows another user's info, a follow button and their articles", async () => {
    const { harness, query, follow } = await setup({ username: 'me' });
    await harness.navigateByUrl('/@bob');
    const el: HTMLElement = harness.routeNativeElement!;
    expect(el.querySelector('.user-info h4')!.textContent).toBe('bob');
    expect(el.querySelector('.user-info p')!.textContent).toBe('bio of bob');
    expect(el.querySelector('img.user-img')!.getAttribute('src')).toBe('b.png');
    expect(el.textContent).not.toContain('Edit Profile Settings');
    expect(el.querySelector('.articles-toggle .nav-link.active')!.textContent!.trim()).toBe(
      'My Articles',
    );
    expect(query).toHaveBeenLastCalledWith({
      type: 'all',
      filters: { author: 'bob', limit: 5, offset: 0 },
    });

    const btn = el.querySelector<HTMLButtonElement>('app-follow-btn button')!;
    expect(btn.textContent).toContain('Follow bob');
    btn.click();
    harness.detectChanges();
    expect(follow).toHaveBeenCalledWith('bob');
    expect(el.querySelector('app-follow-btn button')!.textContent).toContain('Unfollow bob');
  });

  it('shows Edit Profile Settings on your own profile and lists favorites on the tab', async () => {
    const { harness, query } = await setup({ username: 'bob' });
    await harness.navigateByUrl('/@bob/favorites');
    const el: HTMLElement = harness.routeNativeElement!;
    expect(el.textContent).toContain('Edit Profile Settings');
    expect(el.querySelector('app-follow-btn')).toBeNull();
    expect(el.querySelector('.articles-toggle .nav-link.active')!.textContent!.trim()).toBe(
      'Favorited Articles',
    );
    expect(el.querySelectorAll('.articles-toggle .nav-link.active').length).toBe(1);
    expect(query).toHaveBeenLastCalledWith({
      type: 'all',
      filters: { favorited: 'bob', limit: 5, offset: 0 },
    });
  });
});

describe('profileListConfig', () => {
  it('filters by author or by favorited', () => {
    expect(profileListConfig('a', false)).toEqual({ type: 'all', filters: { author: 'a' } });
    expect(profileListConfig('a', true)).toEqual({ type: 'all', filters: { favorited: 'a' } });
  });
});
