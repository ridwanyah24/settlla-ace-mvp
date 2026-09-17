"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
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
  const { signIn } = useAuth();

  const [role, setRole] = useState<UserRole>("tenant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    signIn(email.trim(), role, password);
    router.push(role === "agent" ? "/dashboard/agent" : "/dashboard/tenant");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Simple Header */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 transition-colors">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">Settlla</span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top Banner with Trust */}
          <div className="bg-[#0B1528] text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30 mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>HB&amp;A Mandate Verified Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Sign in to your account
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Access your leases, 24-hr escrow protections, and visiting windows.
              </p>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Sign in as:
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

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 font-semibold">
                {error}
              </div>
            )}

            {/* Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder={
                      role === "tenant"
                        ? "e.g. yourname@gmail.com"
                        : "e.g. agent@agency.ng"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Sign In to {role === "agent" ? "Agent Desk" : "Tenant Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
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
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        Settlla Kaduna Hub • Statutory 4-Way Transparency &amp; Escrow Protection
      </footer>
    </div>
  );
}
