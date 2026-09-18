"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatSupabaseAuthError } from "@/lib/settlla/authErrors";
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
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setResending(true);
    try {
      await resendConfirmationEmail(email);
      setCooldown(60);
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
              <strong className="text-slate-900 break-all">{email}</strong>. Open it to finish —
              you can close this tab after you click the link.
            </>
          )}
        </p>
      </div>

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
