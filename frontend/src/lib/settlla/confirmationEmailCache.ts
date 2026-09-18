const STORAGE_KEY = "settlla_confirm_emails_sent";
const WINDOW_MS = 15 * 60 * 1000;

type SentEntry = { email: string; at: number };

function readEntries(): SentEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list: SentEntry[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - WINDOW_MS;
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

export function markConfirmationEmailSent(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  const next = readEntries().filter((entry) => entry.email !== normalized);
  next.push({ email: normalized, at: Date.now() });
  writeEntries(next);
}
