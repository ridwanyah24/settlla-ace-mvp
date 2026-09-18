const STORAGE_KEY = "settlla_confirm_emails_sent";
const TRACK_MS = 24 * 60 * 60 * 1000;
const MIN_RESEND_MS = 120 * 1000;

type SentEntry = { email: string; at: number };

function readEntries(): SentEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list: SentEntry[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - TRACK_MS;
    return list.filter((entry) => entry.email && entry.at > cutoff);
  } catch {
    return [];
  }
}

function writeEntries(entries: SentEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-30)));
  } catch {
    /* ignore quota / private mode */
  }
}

export function wasConfirmationEmailSent(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return readEntries().some((entry) => entry.email === normalized);
}

export function secondsUntilConfirmationResend(email: string): number {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 0;
  const entry = readEntries().find((item) => item.email === normalized);
  if (!entry) return 0;
  const waitMs = MIN_RESEND_MS - (Date.now() - entry.at);
  return waitMs > 0 ? Math.ceil(waitMs / 1000) : 0;
}

export function markConfirmationEmailSent(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  const next = readEntries().filter((entry) => entry.email !== normalized);
  next.push({ email: normalized, at: Date.now() });
  writeEntries(next);
}

export function clearConfirmationEmailSent(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  writeEntries(readEntries().filter((entry) => entry.email !== normalized));
}
