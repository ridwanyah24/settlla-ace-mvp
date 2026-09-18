export function getSupabaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url || url.includes("YOUR_PROJECT") || url.includes("your-project")) {
    return undefined;
  }
  return url;
}

/** Newer dashboards issue sb_publishable_…; older ones use the JWT anon key. */
export function getSupabaseAnonKey(): string | undefined {
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();
  if (!key || key.includes("your_anon") || key.includes("YOUR_")) {
    return undefined;
  }
  return key;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** Canonical public origin for auth emails (not the Supabase dashboard Site URL). */
export function getAuthSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercelHost = (
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    ""
  ).trim();
  if (vercelHost) {
    const host = vercelHost.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}

export function getEmailRedirectTo(): string {
  const site = getAuthSiteUrl();
  return site ? `${site}/auth/callback` : "/auth/callback";
}
