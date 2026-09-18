"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/Button";
import { ConfirmEmailPanel } from "@/components/ConfirmEmailPanel";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  assertPassword,
  formatSupabaseAuthError,
  dashboardPathForRole,
  isEmailNotConfirmedError,
  MIN_PASSWORD_LENGTH,
} from "@/lib/settlla/authErrors";
import { loadPendingAuthFlow, resumeHref } from "@/lib/settlla/pendingAuthFlow";
import {
  ShieldCheck,
  Building2,
  User,
  Lock,
  Mail,
  ArrowRight,
  Home,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, currentUser, authReady } = useAuth();
  const supabaseMode = isSupabaseConfigured();

  const [role, setRole] = useState<UserRole>("tenant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [roleHint, setRoleHint] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") === "1") {
      setConfirmed(true);
    }
    const confirmError = params.get("error");
    const message = params.get("message");
    if (confirmError === "confirm") {
      setError(message || "Email confirmation failed. Request a new link from sign in.");
    }
  }, []);

  useEffect(() => {
    if (!authReady || !currentUser) return;
    const pending = loadPendingAuthFlow();
    router.replace(pending ? resumeHref(pending) : dashboardPathForRole(currentUser.role));
  }, [authReady, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRoleHint(null);

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
      const profile = await signIn(email.trim(), role, password);
      if (role !== profile.role) {
        setRoleHint(
          `This account is registered as a ${profile.role}. Opening your ${profile.role} dashboard.`
        );
      }
      const pending = loadPendingAuthFlow();
      router.push(pending ? resumeHref(pending) : dashboardPathForRole(profile.role));
    } catch (err) {
      if (isEmailNotConfirmedError(err)) {
        setPendingConfirmEmail(email.trim());
        setError(null);
      } else {
        setError(formatSupabaseAuthError(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-4">
        <div className="mx-auto max-w-7xl flex min-w-0 items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 transition-colors">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">Settlla</span>
                <span className="hidden sm:inline rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Kaduna
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <span>&larr;</span> Back to Homes
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="settlla-card w-full max-w-lg overflow-hidden shadow-[var(--shadow-lg)]">
          <div className="relative overflow-hidden bg-[var(--settlla-navy)] p-6 text-white sm:p-8">
            <p className="text-overline mb-3 text-blue-300">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
              Verified portal
            </p>
            <h1 className="text-h2 text-white">Sign in</h1>
            <p className="text-body mt-2 text-slate-300">
              Leases, escrow protection, and tour bookings in one place.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {pendingConfirmEmail ? (
              <ConfirmEmailPanel
                email={pendingConfirmEmail}
                onBack={() => setPendingConfirmEmail(null)}
              />
            ) : (
            <>
            <div>
              <label className="settlla-label">Sign in as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "tenant"
                      ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <User className={`h-5 w-5 ${role === "tenant" ? "text-blue-600" : "text-slate-400"}`} />
                    {role === "tenant" && (
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <strong className="text-xs font-bold text-slate-900">Tenant</strong>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Browse, rent, and track escrow
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("agent")}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "agent"
                      ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Building2 className={`h-5 w-5 ${role === "agent" ? "text-emerald-600" : "text-slate-400"}`} />
                    {role === "agent" && (
                      <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                    )}
                  </div>
                  <strong className="text-xs font-bold text-slate-900">Agent / Manager</strong>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    List properties &amp; seal leases
                  </span>
                </button>
              </div>
            </div>

            {confirmed && !error && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-semibold">
                Email confirmed. Sign in with your password to continue.
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 font-semibold">
                {error}
              </div>
            )}

            {roleHint && !error && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-800 font-semibold">
                {roleHint}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="settlla-label normal-case tracking-normal text-slate-600">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={
                      role === "tenant"
                        ? "e.g. yourname@gmail.com"
                        : "e.g. agent@agency.ng"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="settlla-input pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="settlla-label normal-case tracking-normal text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required={supabaseMode}
                    minLength={supabaseMode ? MIN_PASSWORD_LENGTH : undefined}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="settlla-input pl-10"
                    disabled={submitting}
                  />
                </div>
                {supabaseMode && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    At least {MIN_PASSWORD_LENGTH} characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2"
                disabled={submitting}
              >
                {submitting
                  ? "Signing in…"
                  : `Sign in to ${role === "agent" ? "agent desk" : "tenant hub"}`}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/signup"
                className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                Sign up here
              </Link>
            </div>
            </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        Settlla Kaduna Hub • Statutory 4-Way Transparency &amp; Escrow Protection
      </footer>
    </div>
  );
}
