import { TestBed } from '@angular/core/testing';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  beforeEach(() => localStorage.clear());

  it('saves, reads and destroys the token under the legacy key', () => {
    const jwt = TestBed.inject(JwtService);
    expect(jwt.get()).toBeNull();
    jwt.save('abc');
    expect(localStorage.getItem('jwtToken')).toBe('abc');
    expect(jwt.get()).toBe('abc');
    jwt.destroy();
    expect(jwt.get()).toBeNull();
  });
});
