"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  assertPassword,
  formatSupabaseAuthError,
  MIN_PASSWORD_LENGTH,
} from "@/lib/settlla/authErrors";
import { X, User, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  initialRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
  initialRole = "tenant",
  onSuccess,
}) => {
  const { signIn, signUp } = useAuth();
  const supabaseMode = isSupabaseConfigured();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [relocationContext, setRelocationContext] = useState("Corporate / Bank Transferee");
  const [agencyName, setAgencyName] = useState("");
  const [accreditation, setAccreditation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signin") {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      try {
        assertPassword(password, supabaseMode);
      } catch (err) {
        setError(formatSupabaseAuthError(err));
        return;
      }
      setSubmitting(true);
      try {
        await signIn(email.trim(), role, password);
        if (onSuccess) onSuccess();
        onClose();
      } catch (err) {
        setError(formatSupabaseAuthError(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setError("Please fill out all required fields.");
      return;
    }
    try {
      assertPassword(password, supabaseMode);
    } catch (err) {
      setError(formatSupabaseAuthError(err));
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUp({
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
        ninNumber: role === "tenant" ? ninNumber.trim() : undefined,
        relocationContext: role === "tenant" ? relocationContext : undefined,
        agencyName: role === "agent" ? agencyName.trim() || "Kaduna Prime Realtors" : undefined,
        accreditation:
          role === "agent" ? accreditation.trim() || "ESVARBON / NIESV Registered" : undefined,
      });
      if (result.needsEmailConfirmation) {
        setConfirmEmailSent(email.trim());
        return;
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-base shadow-sm">
              S
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {mode === "signin" ? "Sign In to Settlla" : "Create Settlla Account"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {confirmEmailSent ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Check your email</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We sent a confirmation link to <strong>{confirmEmailSent}</strong>. Confirm your
                email, then sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfirmEmailSent(null);
                  setMode("signin");
                  setError(null);
                }}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white cursor-pointer"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <>
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setConfirmEmailSent(null);
              }}
              className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setConfirmEmailSent(null);
              }}
              className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Selector Card */}
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1.5 tracking-wider">
              {mode === "signin" ? "Sign in as:" : "Register as:"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                  role === "tenant"
                    ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <User className="w-5 h-5 text-blue-600" />
                  {role === "tenant" && (
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Tenant</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Rent vetted homes with ₦0 tour fee &amp; escrow.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("agent")}
                className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                  role === "agent"
                    ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  {role === "agent" && (
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">Agent / Manager</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  List vetted homes &amp; counter-sign leases.
                </p>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === "tenant" ? "e.g. Amina Bello" : "e.g. Barrister Ibrahim Yusuf"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder={role === "tenant" ? "user@example.com" : "agent@agency.ng"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  WhatsApp Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0803 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            {/* Role Specific Signup Fields */}
            {mode === "signup" && role === "tenant" && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    National Identification Number (NIN) <span className="text-slate-400">(Optional for instant badge)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5829 4810 3921"
                    value={ninNumber}
                    onChange={(e) => setNinNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Relocation Context / Employment
                  </label>
                  <select
                    value={relocationContext}
                    onChange={(e) => setRelocationContext(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Corporate / Bank Transferee">Corporate / Bank Transferee</option>
                    <option value="NYSC Corps Member">NYSC Corps Member</option>
                    <option value="Remote Tech Worker / Professional">Remote Tech Worker / Professional</option>
                    <option value="Relocating Family">Relocating Family</option>
                    <option value="Civil Servant / Government Official">Civil Servant / Government Official</option>
                  </select>
                </div>
              </>
            )}

            {mode === "signup" && role === "agent" && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estate Agency / Firm Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HB&A Partners & Co."
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ESVARBON / Professional Reg. No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ESVARBON / NIESV Reg. #A2840"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password {supabaseMode && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="password"
                required={supabaseMode}
                minLength={supabaseMode ? MIN_PASSWORD_LENGTH : undefined}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={submitting}
              />
              {supabaseMode && (
                <p className="mt-1 text-[10px] text-slate-400">
                  At least {MIN_PASSWORD_LENGTH} characters
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/25 cursor-pointer"
              >
                {submitting
                  ? mode === "signin"
                    ? "Signing in…"
                    : "Creating account…"
                  : mode === "signin"
                    ? `Sign In as ${role === "tenant" ? "Tenant" : "Agent"}`
                    : "Create Account & Go to Dashboard"}
              </button>
            </div>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
