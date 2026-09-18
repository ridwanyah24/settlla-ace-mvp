"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardPathForRole } from "@/lib/settlla/authErrors";
import { loadPendingAuthFlow, resumeHref } from "@/lib/settlla/pendingAuthFlow";

export default function AuthContinuePage() {
  const router = useRouter();
  const { currentUser, authReady } = useAuth();

  useEffect(() => {
    if (!authReady) return;

    const pending = loadPendingAuthFlow();
    if (pending) {
      router.replace(resumeHref(pending));
      return;
    }

    if (currentUser) {
      router.replace(dashboardPathForRole(currentUser.role));
      return;
    }

    router.replace("/login?confirmed=1");
  }, [authReady, currentUser, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <p className="mt-4 text-xs font-semibold text-slate-500">Confirming your email…</p>
    </div>
  );
}
