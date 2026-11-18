import { AuthState, User } from './models';
import { JwtService } from './services/jwt.service';
import { UserService } from './services/user.service';

export interface ConduitDebug {
  getToken: () => string | null;
  getAuthState: () => AuthState;
  getCurrentUser: () => User | null;
}

declare global {
  interface Window {
    __conduit_debug__?: ConduitDebug;
  }
}

/** Exposes `window.__conduit_debug__` as required by the RealWorld E2E selector contract. */
export function installDebugInterface(jwt: JwtService, user: UserService): void {
  window.__conduit_debug__ = {
    getToken: () => jwt.get(),
    getAuthState: () => user.authState(),
    getCurrentUser: () => user.currentUser(),
  };
}
