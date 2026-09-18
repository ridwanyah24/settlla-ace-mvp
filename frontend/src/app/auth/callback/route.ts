import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthSiteUrl } from "@/lib/supabase/config";

function redirectOrigin(request: Request): string {
  const configured = getAuthSiteUrl();
  if (configured) return configured;
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");
  const origin = redirectOrigin(request);

  if (authError) {
    const description = requestUrl.searchParams.get("error_description") || "Could not confirm email.";
    return NextResponse.redirect(
      `${origin}/login?error=confirm&message=${encodeURIComponent(description)}`
    );
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/login?confirmed=1`);
      }
    }
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  return NextResponse.redirect(`${origin}/login?confirmed=1`);
}
