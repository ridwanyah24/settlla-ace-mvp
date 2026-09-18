"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, UserRole } from "@/types/auth";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getEmailRedirectTo, isSupabaseConfigured } from "@/lib/supabase/config";
import { profileRowToUser, ProfileRow } from "@/lib/settlla/profiles";
import { assertPassword, formatSupabaseAuthError, isAlreadyRegisteredError, isAuthRateLimitError } from "@/lib/settlla/authErrors";
import {
  clearConfirmationEmailSent,
  markConfirmationEmailSent,
  secondsUntilConfirmationResend,
} from "@/lib/settlla/confirmationEmailCache";

export type SignUpResult = {
  needsEmailConfirmation: boolean;
  user: UserProfile | null;
  /** Supabase accepted sending a confirmation email on this request */
  confirmationEmailSent?: boolean;
  resendAvailableInSeconds?: number;
  rateLimited?: boolean;
  /** Auth user missing (e.g. deleted in dashboard) — run signUp again from Pay */
  accountMissing?: boolean;
};

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  authReady: boolean;
  signIn: (email: string, role?: UserRole, password?: string) => Promise<UserProfile>;
  signUp: (
    profile: Partial<UserProfile> & {
      role: UserRole;
      fullName: string;
      email: string;
      phoneNumber: string;
      password?: string;
    },
    options?: { resendIfAwaitingConfirmation?: boolean }
  ) => Promise<SignUpResult>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "settlla_active_user";
const USERS_DB_KEY = "settlla_users_db";

function formatNameFromEmail(email: string): string {
  const username = email.split("@")[0] || "";
  const cleaned = username.replace(/[._-]/g, " ").trim();
  if (!cleaned) return "User";
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function saveLocalUser(user: UserProfile | null) {
  try {
    if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const applyUser = useCallback((user: UserProfile | null) => {
    setCurrentUser(user);
    saveLocalUser(user);
  }, []);

  const loadProfileFromSupabase = useCallback(async (userId: string, email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      // Minimal fallback if trigger hasn't written yet
      if (email) {
        return {
          id: userId,
          fullName: formatNameFromEmail(email),
          email,
          phoneNumber: "0803 123 4567",
          role: "tenant" as UserRole,
          verifiedStatus: "verified" as const,
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    }
    return profileRowToUser(data as ProfileRow);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) setCurrentUser(parsed);
        }
      } catch {
        setCurrentUser(null);
      }
      setAuthReady(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        const profile = await loadProfileFromSupabase(session.user.id, session.user.email || "");
        if (profile) applyUser(profile);
      }
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        const profile = await loadProfileFromSupabase(session.user.id, session.user.email || "");
        if (profile) applyUser(profile);
      } else {
        applyUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [applyUser, loadProfileFromSupabase]);

  const signInLocal = (email: string, preferredRole?: UserRole): UserProfile => {
    const cleanEmail = email.trim();
    const effectiveRole = preferredRole || (cleanEmail.toLowerCase().includes("agent") ? "agent" : "tenant");

    let existingProfile: UserProfile | null = null;
    try {
      const dbRaw = localStorage.getItem(USERS_DB_KEY);
      if (dbRaw) {
        const users: UserProfile[] = JSON.parse(dbRaw);
        const match = users.find((u) => u.email.toLowerCase() === cleanEmail.toLowerCase());
        if (match) existingProfile = { ...match, role: effectiveRole };
      }
    } catch {
      /* ignore */
    }

    if (existingProfile) {
      applyUser(existingProfile);
      return existingProfile;
    }

    const derivedName = formatNameFromEmail(cleanEmail);
    const newProfile: UserProfile = {
      id: `usr_${effectiveRole}_${Date.now()}`,
      fullName: derivedName || (effectiveRole === "agent" ? "Accredited Agent" : "Verified Tenant"),
      email: cleanEmail,
      phoneNumber: "0803 123 4567",
      role: effectiveRole,
      ninNumber: effectiveRole === "tenant" ? "5829 4810 3921" : undefined,
      relocationContext: effectiveRole === "tenant" ? "Incoming Kaduna Resident" : undefined,
      agencyName: effectiveRole === "agent" ? `${derivedName} & Partners` : undefined,
      accreditation: effectiveRole === "agent" ? "ESVARBON / NIESV Accredited" : undefined,
      mandateCount: effectiveRole === "agent" ? 6 : undefined,
      verifiedStatus: "verified",
      createdAt: new Date().toISOString(),
    };

    applyUser(newProfile);
    try {
      const dbRaw = localStorage.getItem(USERS_DB_KEY);
      const users: UserProfile[] = dbRaw ? JSON.parse(dbRaw) : [];
      if (!users.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
        users.push(newProfile);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }
    } catch {
      /* ignore */
    }
    return newProfile;
  };

  const signIn = async (email: string, preferredRole?: UserRole, password?: string): Promise<UserProfile> => {
    const cleanEmail = email.trim();
    const supabaseMode = isSupabaseConfigured();
    const supabase = getSupabaseBrowserClient();

    if (supabaseMode && supabase) {
      try {
        const safePassword = assertPassword(password, true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: safePassword,
        });
        if (error) throw error;
        if (!data.user) throw new Error("Sign-in failed. Please try again.");

        const profile = await loadProfileFromSupabase(data.user.id, data.user.email || cleanEmail);
        if (!profile) throw new Error("Could not load your Settlla profile. Please try again.");

        applyUser(profile);
        return profile;
      } catch (err) {
        throw new Error(formatSupabaseAuthError(err));
      }
    }

    return signInLocal(cleanEmail, preferredRole);
  };

  const signUp = async (
    data: Partial<UserProfile> & {
      role: UserRole;
      fullName: string;
      email: string;
      phoneNumber: string;
      password?: string;
    },
    options?: { resendIfAwaitingConfirmation?: boolean }
  ): Promise<SignUpResult> => {
    const cleanEmail = data.email.trim();
    const supabaseMode = isSupabaseConfigured();
    const supabase = getSupabaseBrowserClient();

    const awaitingConfirmResult = (
      sendResult: "sent" | "rate_limited" | "skipped" | "no_user",
      waitSec: number
    ): SignUpResult => ({
      needsEmailConfirmation: true,
      user: null,
      confirmationEmailSent: sendResult === "sent",
      rateLimited: sendResult === "rate_limited",
      resendAvailableInSeconds: sendResult === "skipped" ? waitSec : undefined,
    });

    if (supabaseMode && supabase) {
      try {
        const safePassword = assertPassword(data.password, true);
        const redirectTo = getEmailRedirectTo();

        const sendConfirmationLink = async (): Promise<"sent" | "rate_limited" | "skipped" | "no_user"> => {
          const waitSec = secondsUntilConfirmationResend(cleanEmail);
          if (waitSec > 0) return "skipped";

          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: cleanEmail,
            options: { emailRedirectTo: redirectTo },
          });
          if (resendError) {
            if (isAuthRateLimitError(resendError)) return "rate_limited";
            const msg = (resendError.message || "").toLowerCase();
            if (msg.includes("user not found") || msg.includes("not found")) {
              clearConfirmationEmailSent(cleanEmail);
              return "no_user";
            }
            throw resendError;
          }
          markConfirmationEmailSent(cleanEmail);
          return "sent";
        };

        const { data: authData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: safePassword,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name: data.fullName.trim(),
              role: data.role,
              phone_number: data.phoneNumber.trim(),
              nin_number: data.ninNumber,
              relocation_context: data.relocationContext,
              agency_name: data.agencyName,
              accreditation: data.accreditation,
            },
          },
        });

        if (error) {
          if (isAlreadyRegisteredError(error)) {
            const sendResult = await sendConfirmationLink();
            if (sendResult === "no_user") {
              clearConfirmationEmailSent(cleanEmail);
              return {
                needsEmailConfirmation: true,
                user: null,
                confirmationEmailSent: false,
                accountMissing: true,
              };
            }
            if (sendResult === "rate_limited") {
              markConfirmationEmailSent(cleanEmail);
            }
            return awaitingConfirmResult(sendResult, secondsUntilConfirmationResend(cleanEmail));
          }
          throw error;
        }

        // Email confirmation enabled: no session until the user clicks the email link
        if (!authData.session) {
          const identities = authData.user?.identities;
          const looksLikeExistingUnconfirmed =
            Array.isArray(identities) && identities.length === 0;
          if (looksLikeExistingUnconfirmed) {
            const sendResult = await sendConfirmationLink();
            if (sendResult === "no_user") {
              clearConfirmationEmailSent(cleanEmail);
              return {
                needsEmailConfirmation: true,
                user: null,
                confirmationEmailSent: false,
                accountMissing: true,
              };
            }
            if (sendResult === "rate_limited") {
              markConfirmationEmailSent(cleanEmail);
            }
            return awaitingConfirmResult(sendResult, secondsUntilConfirmationResend(cleanEmail));
          }
          markConfirmationEmailSent(cleanEmail);
          return {
            needsEmailConfirmation: true,
            user: null,
            confirmationEmailSent: true,
          };
        }

        // Session present — enrich profile (trigger already created the row)
        await supabase
          .from("profiles")
          .update({
            email: cleanEmail,
            full_name: data.fullName.trim(),
            phone_number: data.phoneNumber.trim(),
            role: data.role,
            nin_number: data.ninNumber ?? null,
            relocation_context: data.relocationContext ?? null,
            agency_name: data.agencyName ?? null,
            accreditation: data.accreditation ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", authData.user.id);

        const profile = await loadProfileFromSupabase(authData.user.id, cleanEmail);
        if (profile) applyUser(profile);

        return { needsEmailConfirmation: false, user: profile };
      } catch (err) {
        throw new Error(formatSupabaseAuthError(err));
      }
    }

    // Local demo mode (no Supabase)
    const newUser: UserProfile = {
      id: `usr_${data.role}_${Date.now()}`,
      fullName: data.fullName.trim() || formatNameFromEmail(cleanEmail),
      email: cleanEmail,
      phoneNumber: data.phoneNumber.trim() || "0803 000 0000",
      role: data.role,
      ninNumber: data.ninNumber || (data.role === "tenant" ? "4910 2039 1847" : undefined),
      relocationContext:
        data.relocationContext || (data.role === "tenant" ? "Kaduna Resident / Relocating" : undefined),
      agencyName: data.agencyName || (data.role === "agent" ? "Kaduna Real Estate Partners" : undefined),
      accreditation:
        data.accreditation || (data.role === "agent" ? "ESVARBON / NIESV Registered" : undefined),
      mandateCount: data.role === "agent" ? 1 : undefined,
      verifiedStatus: "verified",
      createdAt: new Date().toISOString(),
    };

    applyUser(newUser);
    try {
      const dbRaw = localStorage.getItem(USERS_DB_KEY);
      const users: UserProfile[] = dbRaw ? JSON.parse(dbRaw) : [];
      const filtered = users.filter((u) => u.email.toLowerCase() !== cleanEmail.toLowerCase());
      filtered.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(filtered));
    } catch {
      /* ignore */
    }

    return { needsEmailConfirmation: false, user: newUser };
  };

  const resendConfirmationEmail = async (email: string): Promise<void> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Settlla is not connected to Supabase.");

    const cleanEmail = email.trim();
    const waitSec = secondsUntilConfirmationResend(cleanEmail);
    if (waitSec > 0) {
      throw new Error(`Please wait ${waitSec}s before requesting another link.`);
    }

    const redirectTo = getEmailRedirectTo();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      const message = (error.message || "").toLowerCase();
      if (
        message.includes("already confirmed") ||
        message.includes("email address is already confirmed")
      ) {
        throw new Error("This email is already confirmed. Sign in with your password to continue.");
      }
      if (message.includes("user not found") || message.includes("not found")) {
        clearConfirmationEmailSent(cleanEmail);
        throw new Error(
          "No account exists for this email in Supabase. Close this step, then tap Pay once to register again."
        );
      }
      throw new Error(formatSupabaseAuthError(error));
    }
    markConfirmationEmailSent(cleanEmail);
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    applyUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role: newRole,
      agencyName:
        newRole === "agent" ? currentUser.agencyName || `${currentUser.fullName} & Partners` : undefined,
      accreditation:
        newRole === "agent" ? currentUser.accreditation || "ESVARBON / NIESV Registered" : undefined,
    };
    applyUser(updated);

    const supabase = getSupabaseBrowserClient();
    if (supabase && currentUser.id && !currentUser.id.startsWith("usr_")) {
      supabase.from("profiles").update({ role: newRole }).eq("id", currentUser.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: Boolean(currentUser),
        authReady,
        signIn,
        signUp,
        resendConfirmationEmail,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
