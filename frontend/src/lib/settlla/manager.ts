import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function fetchPendingSignatureCount(): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return isSupabaseConfigured() ? 0 : 0;

  const { count, error } = await supabase
    .from("agreements")
    .select("*", { count: "exact", head: true })
    .eq("status", "tenant_signed");

  if (error) {
    console.warn("[settlla] pending count:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function fetchPendingAgreements(): Promise<unknown[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("agreements")
    .select("document")
    .in("status", ["tenant_signed", "fully_executed", "draft_ready_for_signature"])
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error || !data) {
    if (error) console.warn("[settlla] pending agreements:", error.message);
    return [];
  }
  return data.map((r: { document: unknown }) => r.document);
}
