"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, UserRole } from "@/types/auth";
import { assertPassword, formatSupabaseAuthError } from "@/lib/settlla/authErrors";
import {
  markConfirmationEmailSent,
  secondsUntilConfirmationResend,
} from "@/lib/settlla/confirmationEmailCache";

export type SignUpResult = {
  needsEmailConfirmation: boolean;
  user: UserProfile | null;
  confirmationEmailSent?: boolean;
  resendAvailableInSeconds?: number;
  rateLimited?: boolean;
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

  useEffect(() => {
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
  }, []);

  const signInLocal = (email: string, preferredRole?: UserRole, password?: string): UserProfile => {
    const cleanEmail = email.trim();
    const effectiveRole = preferredRole || (cleanEmail.toLowerCase().includes("agent") ? "agent" : "tenant");
    if (password?.trim()) assertPassword(password, false);

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
    try {
      return signInLocal(email.trim(), preferredRole, password);
    } catch (err) {
      throw new Error(formatSupabaseAuthError(err));
    }
  };

  const signUp = async (
    data: Partial<UserProfile> & {
      role: UserRole;
      fullName: string;
      email: string;
      phoneNumber: string;
      password?: string;
    },
    _options?: { resendIfAwaitingConfirmation?: boolean }
  ): Promise<SignUpResult> => {
    const cleanEmail = data.email.trim();
    if (data.password?.trim()) assertPassword(data.password, false);

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
    const cleanEmail = email.trim();
    const waitSec = secondsUntilConfirmationResend(cleanEmail);
    if (waitSec > 0) {
      throw new Error(`Please wait ${waitSec}s before requesting another link.`);
    }
    markConfirmationEmailSent(cleanEmail);
  };

  const signOut = async () => {
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
