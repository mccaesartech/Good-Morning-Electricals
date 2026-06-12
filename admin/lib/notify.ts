const CONTENT_VERSION_KEY = 'gme_content_version';
const CONTENT_CHANNEL = 'gme_content_channel';

/** Signals the public site to bypass its content cache (shared localStorage). */
export function notifyContentPublished(): void {
  if (typeof window === 'undefined') return;
  const version = String(Date.now());
  try {
    localStorage.setItem(CONTENT_VERSION_KEY, version);
  } catch {
    /* ignore quota / private mode */
  }
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CONTENT_CHANNEL);
      channel.postMessage({ type: 'content-published', version });
      channel.close();
    }
  } catch {
    /* ignore */
  }
}
