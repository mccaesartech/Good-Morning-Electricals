const CONTENT_VERSION_KEY = 'gme_content_version';

/** Signals the public site to bypass its content cache (shared localStorage). */
export function notifyContentPublished(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTENT_VERSION_KEY, String(Date.now()));
  } catch {
    /* ignore quota / private mode */
  }
}
