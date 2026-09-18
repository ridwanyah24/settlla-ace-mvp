/** Backend integration disabled — app runs as a seamless client-side demo. */
export function isSupabaseConfigured(): boolean {
  return false;
}

export function getSupabaseUrl(): string | undefined {
  return undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  return undefined;
}

export function getEmailRedirectTo(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  return "http://localhost:3000/auth/callback";
}
