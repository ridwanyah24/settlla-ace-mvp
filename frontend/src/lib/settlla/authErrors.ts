/** Supabase Auth default min password length */
export const MIN_PASSWORD_LENGTH = 6;

export class AuthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthValidationError";
  }
}

/**
 * When Supabase is configured, password is required (min 6 chars).
 * When not configured (local demo), password is optional.
 */
export function assertPassword(password: string | undefined | null, supabaseMode: boolean): string {
  const trimmed = (password ?? "").trim();
  if (!supabaseMode) return trimmed;
  if (!trimmed) {
    throw new AuthValidationError("Please enter your password.");
  }
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    throw new AuthValidationError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }
  return trimmed;
}

export function isEmailNotConfirmedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; code?: string };
  const message = (err.message || "").toLowerCase();
  const code = (err.code || "").toLowerCase();
  return (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed") ||
    message.includes("confirm your email")
  );
}

export function isAlreadyRegisteredError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; code?: string };
  const message = (err.message || "").toLowerCase();
  return (
    message.includes("user already registered") ||
    message.includes("already been registered")
  );
}

export function formatSupabaseAuthError(error: unknown): string {
  if (error instanceof AuthValidationError) return error.message;
  if (!error || typeof error !== "object") {
    return "Authentication failed. Please try again.";
  }

  const err = error as { message?: string; code?: string; status?: number };
  const message = (err.message || "").toLowerCase();
  const code = (err.code || "").toLowerCase();

  if (isEmailNotConfirmedError(error)) {
    return "Confirm the link we sent to your email, then sign in.";
  }

  if (
    code === "otp_expired" ||
    message.includes("otp_expired") ||
    message.includes("email link is invalid") ||
    ((message.includes("expired") || message.includes("token has expired")) &&
      (message.includes("otp") || message.includes("token") || message.includes("link")))
  ) {
    return "That confirmation link has expired. Request a new one from sign in.";
  }

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "Incorrect email or password. Please try again.";
  }

  if (message.includes("user already registered") || message.includes("already been registered")) {
    return "An account with this email already exists. Sign in instead.";
  }

  if (
    message.includes("password") &&
    (message.includes("at least") || message.includes("weak") || message.includes("short"))
  ) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    err.status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("email rate limit")
  ) {
    return "Too many confirmation emails were sent just now. Wait a few minutes, then try again.";
  }

  if (err.message && err.message.trim()) {
    return err.message.trim();
  }

  return "Authentication failed. Please try again.";
}

export function dashboardPathForRole(role: "tenant" | "agent"): string {
  return role === "agent" ? "/dashboard/agent" : "/dashboard/tenant";
}
