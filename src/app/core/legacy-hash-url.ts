/** Maps AngularJS hash URLs (`/#/article/x`) to path URLs (`/article/x`); returns null otherwise. */
export function legacyHashUrl(hash: string): string | null {
  return hash.startsWith('#/') ? hash.slice(1) : null;
}

export function redirectLegacyHashUrl(): void {
  const url = legacyHashUrl(window.location.hash);
  if (url !== null) {
    window.history.replaceState(window.history.state, '', url);
  }
}
