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
