export function friendlyError(message: string, fallback = 'Failed to save content'): string {
  const msg = (message || '').trim();
  if (!msg) return fallback;

  if (/permission|policy|row-level|not authorized|42501/i.test(msg)) {
    return 'Permission denied. You may not have access to perform this action.';
  }
  if (/fetch|network|failed to fetch|load failed|timeout/i.test(msg)) {
    return 'Network error. Check your connection and try again.';
  }
  if (/jwt|session|auth|401|403/i.test(msg)) {
    return 'Session expired. Please sign in again.';
  }
  if (/storage|upload|bucket/i.test(msg)) {
    return `Failed to upload image: ${msg}`;
  }

  return msg;
}
