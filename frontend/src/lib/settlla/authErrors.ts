/** Supabase Auth default min password length */
export const MIN_PASSWORD_LENGTH = 6;

export const EMAIL_OTP_MIN_LENGTH = 6;
export const EMAIL_OTP_MAX_LENGTH = 8;

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

export function assertEmailOtp(code: string | undefined | null): string {
  const trimmed = (code ?? "").replace(/\s/g, "");
  if (!trimmed) {
    throw new AuthValidationError("Enter the verification code from your email.");
  }
  if (trimmed.length < EMAIL_OTP_MIN_LENGTH || trimmed.length > EMAIL_OTP_MAX_LENGTH) {
    throw new AuthValidationError(
      `Enter the ${EMAIL_OTP_MIN_LENGTH}-digit code from your email.`
    );
  }
  if (!/^\d+$/.test(trimmed)) {
    throw new AuthValidationError("The verification code should be numbers only.");
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

export function formatSupabaseAuthError(error: unknown): string {
  if (error instanceof AuthValidationError) return error.message;
  if (!error || typeof error !== "object") {
    return "Authentication failed. Please try again.";
  }

  const err = error as { message?: string; code?: string; status?: number };
  const message = (err.message || "").toLowerCase();
  const code = (err.code || "").toLowerCase();

  if (isEmailNotConfirmedError(error)) {
    return "Enter the verification code we sent to your email, then try again.";
  }

  if (
    code === "otp_expired" ||
    message.includes("otp_expired") ||
    ((message.includes("expired") || message.includes("token has expired")) &&
      (message.includes("otp") || message.includes("token") || message.includes("code")))
  ) {
    return "That code has expired. Request a new one.";
  }

  if (
    code === "otp_disabled" ||
    message.includes("invalid otp") ||
    message.includes("token is invalid") ||
    message.includes("invalid token")
  ) {
    return "That code is incorrect or expired. Check the email and try again.";
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

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (err.message && err.message.trim()) {
    return err.message.trim();
  }

  return "Authentication failed. Please try again.";
}

export function dashboardPathForRole(role: "tenant" | "agent"): string {
  return role === "agent" ? "/dashboard/agent" : "/dashboard/tenant";
}
