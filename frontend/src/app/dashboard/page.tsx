"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirect() {
  const router = useRouter();
  const { role, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (role === "agent") {
      router.replace("/dashboard/agent");
    } else {
      router.replace("/dashboard/tenant");
    }
  }, [role, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Loading your Settlla dashboard...</p>
      </div>
    </div>
  );
}
