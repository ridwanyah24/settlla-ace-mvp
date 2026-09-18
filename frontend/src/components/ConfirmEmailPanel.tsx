"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatSupabaseAuthError } from "@/lib/settlla/authErrors";
import { secondsUntilConfirmationResend } from "@/lib/settlla/confirmationEmailCache";
import { Mail } from "lucide-react";

interface ConfirmEmailPanelProps {
  email: string;
  title?: string;
  description?: React.ReactNode;
  onBack?: () => void;
}

export const ConfirmEmailPanel: React.FC<ConfirmEmailPanelProps> = ({
  email,
  title = "Check your email",
  description,
  onBack,
}) => {
  const { resendConfirmationEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(() => secondsUntilConfirmationResend(email) || 120);

  useEffect(() => {
    setCooldown(secondsUntilConfirmationResend(email) || 0);
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setSuccess(null);
    setResending(true);
    try {
      await resendConfirmationEmail(email);
      setSuccess("New confirmation link sent. Check your inbox and spam folder.");
      setCooldown(secondsUntilConfirmationResend(email) || 120);
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Mail className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
          {description || (
            <>
              We sent a confirmation link to{" "}
              <strong className="text-slate-900 break-all">{email}</strong>. If it expired, use{" "}
              <strong>Resend</strong> below (not Pay). Check spam/promotions too.
            </>
          )}
        </p>
      </div>

      {success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 font-semibold text-left">
          {success}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 font-semibold text-left">
          {error}
        </p>
      )}

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
              ? `Resend link in ${cooldown}s`
              : "Resend confirmation link"}
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
