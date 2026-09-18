"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/types/auth";
import {
  assertEmailOtp,
  formatSupabaseAuthError,
  EMAIL_OTP_MAX_LENGTH,
  EMAIL_OTP_MIN_LENGTH,
} from "@/lib/settlla/authErrors";
import { Mail, ArrowRight } from "lucide-react";

interface EmailCodeVerifyProps {
  email: string;
  title?: string;
  onVerified: (user: UserProfile) => void;
  onBack?: () => void;
}

export const EmailCodeVerify: React.FC<EmailCodeVerifyProps> = ({
  email,
  title = "Enter your verification code",
  onVerified,
  onBack,
}) => {
  const { verifyEmailCode, resendEmailCode } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    let token: string;
    try {
      token = assertEmailOtp(code);
    } catch (err) {
      setError(formatSupabaseAuthError(err));
      return;
    }

    setSubmitting(true);
    try {
      const user = await verifyEmailCode(email, token);
      onVerified(user);
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setResending(true);
    try {
      await resendEmailCode(email);
      setCooldown(60);
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Mail className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
          We sent a {EMAIL_OTP_MIN_LENGTH}-digit code to{" "}
          <strong className="text-slate-900 break-all">{email}</strong>. Enter it here — no link
          required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        <label className="settlla-label normal-case tracking-normal text-slate-600">
          Verification code
        </label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={EMAIL_OTP_MAX_LENGTH}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, EMAIL_OTP_MAX_LENGTH));
            setError(null);
          }}
          placeholder="000000"
          className="settlla-input text-center font-mono text-xl tracking-[0.35em] font-bold"
          disabled={submitting}
        />

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 font-semibold">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || code.length < EMAIL_OTP_MIN_LENGTH}
          className="btn btn-primary btn-md w-full disabled:opacity-50"
        >
          {submitting ? "Verifying…" : "Verify email"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {resending
            ? "Sending…"
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
        </button>
        {onBack && (
          <button type="button" onClick={onBack} className="font-medium text-slate-500 hover:text-slate-800">
            Use a different email
          </button>
        )}
      </div>
    </div>
  );
};
