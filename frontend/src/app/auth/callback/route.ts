import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const authError = requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;

  if (authError) {
    const description = requestUrl.searchParams.get("error_description") || "Could not confirm email.";
    return NextResponse.redirect(
      `${origin}/login?error=confirm&message=${encodeURIComponent(description)}`
    );
  }

  return NextResponse.redirect(`${origin}/auth/continue`);
}
