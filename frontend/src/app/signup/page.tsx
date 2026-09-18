"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  assertPassword,
  formatSupabaseAuthError,
  dashboardPathForRole,
  MIN_PASSWORD_LENGTH,
} from "@/lib/settlla/authErrors";
import { EmailCodeVerify } from "@/components/EmailCodeVerify";
import {
  ShieldCheck,
  Building2,
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Home,
  Briefcase,
  BadgeCheck,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, currentUser, authReady } = useAuth();
  const supabaseMode = isSupabaseConfigured();

  const [role, setRole] = useState<UserRole>("tenant");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [relocationContext, setRelocationContext] = useState("Corporate / Bank Transferee");
  const [agencyName, setAgencyName] = useState("");
  const [accreditation, setAccreditation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && currentUser && !confirmEmailSent) {
      router.replace(dashboardPathForRole(currentUser.role));
    }
  }, [authReady, currentUser, router, confirmEmailSent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setError("Please fill in all required fields.");
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

      const destRole = result.user?.role || role;
      router.push(dashboardPathForRole(destRole));
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmEmailSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">Settlla</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <EmailCodeVerify
              email={confirmEmailSent}
              onVerified={(user) => router.replace(dashboardPathForRole(user.role))}
              onBack={() => setConfirmEmailSent(null)}
            />
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
          Settlla Kaduna Hub • Statutory 4-Way Transparency &amp; Escrow Protection
        </footer>
      </div>
    );
  }

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
        <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-[#0B1528] text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30 mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Kaduna Rental Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Create your Settlla Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Zero roadside fees, transparent statutory pricing, and Key-In-Door escrow.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                I am registering as:
              </label>
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
                    Rent verified homes with ₦0 tour fee
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
                    List properties &amp; sign leases
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={role === "tenant" ? "e.g. Amina Bello" : "e.g. Barrister Ibrahim Yusuf"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    WhatsApp Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="0803 123 4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {role === "tenant" ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      National ID Number (NIN){" "}
                      <span className="text-slate-400">(Optional for verified badge)</span>
                    </label>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 5829 4810 3921"
                        value={ninNumber}
                        onChange={(e) => setNinNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Relocation Context / Occupation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <select
                        value={relocationContext}
                        onChange={(e) => setRelocationContext(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        disabled={submitting}
                      >
                        <option value="Corporate / Bank Transferee">Corporate / Bank Transferee</option>
                        <option value="NYSC Corps Member">NYSC Corps Member</option>
                        <option value="Remote Tech Worker / Professional">
                          Remote Tech Worker / Professional
                        </option>
                        <option value="Relocating Family">Relocating Family</option>
                        <option value="Civil Servant / Kaduna State Employee">
                          Civil Servant / Kaduna State Employee
                        </option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Estate Agency / Firm Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. HB&A Partners & Co."
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Professional Accreditation
                    </label>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. ESVARBON / NIESV Reg. #A2840"
                        value={accreditation}
                        onChange={(e) => setAccreditation(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required={supabaseMode}
                    minLength={supabaseMode ? MIN_PASSWORD_LENGTH : undefined}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    disabled={submitting}
                  />
                </div>
                {supabaseMode && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    At least {MIN_PASSWORD_LENGTH} characters
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>
                  {submitting ? "Creating account…" : "Complete Registration & Open Dashboard"}
                </span>
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        Settlla Kaduna Hub • Statutory 4-Way Transparency &amp; Escrow Protection
      </footer>
    </div>
  );
}
