import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;

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
        return NextResponse.redirect(`${origin}/auth/continue`);
      }
    }
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  return NextResponse.redirect(`${origin}/auth/continue`);
}
