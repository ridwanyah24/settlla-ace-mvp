"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types/auth";

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  signIn: (email: string, role?: UserRole, password?: string) => void;
  signUp: (profile: Partial<UserProfile> & { role: UserRole; fullName: string; email: string; phoneNumber: string; password?: string }) => void;
  signOut: () => void;
  switchRole: (role: UserRole) => void;
  loginAsDemoTenant?: () => void;
  loginAsDemoAgent?: () => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        }
      }
    } catch {
      setCurrentUser(null);
    }
    setInitialized(true);
  }, []);

  const saveUser = (user: UserProfile | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {}
  };

  const signIn = (email: string, preferredRole?: UserRole) => {
    const cleanEmail = email.trim();
    const effectiveRole = preferredRole || (cleanEmail.toLowerCase().includes("agent") ? "agent" : "tenant");

    // Check if user previously registered in local database
    let existingProfile: UserProfile | null = null;
    try {
      const dbRaw = localStorage.getItem(USERS_DB_KEY);
      if (dbRaw) {
        const users: UserProfile[] = JSON.parse(dbRaw);
        const match = users.find((u) => u.email.toLowerCase() === cleanEmail.toLowerCase());
        if (match) {
          existingProfile = { ...match, role: effectiveRole };
        }
      }
    } catch {}

    if (existingProfile) {
      saveUser(existingProfile);
      return;
    }

    // Otherwise create instant authenticated profile for this user
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

    saveUser(newProfile);

    // Save to users DB for future lookups
    try {
      const dbRaw = localStorage.getItem(USERS_DB_KEY);
      const users: UserProfile[] = dbRaw ? JSON.parse(dbRaw) : [];
      if (!users.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
        users.push(newProfile);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }
    } catch {}
  };

  const signUp = (data: Partial<UserProfile> & { role: UserRole; fullName: string; email: string; phoneNumber: string }) => {
    const cleanEmail = data.email.trim();
    const newUser: UserProfile = {
      id: `usr_${data.role}_${Date.now()}`,
      fullName: data.fullName.trim() || formatNameFromEmail(cleanEmail),
      email: cleanEmail,
      phoneNumber: data.phoneNumber.trim() || "0803 000 0000",
      role: data.role,
      ninNumber: data.ninNumber || (data.role === "tenant" ? "4910 2039 1847" : undefined),
      relocationContext: data.relocationContext || (data.role === "tenant" ? "Kaduna Resident / Relocating" : undefined),
      agencyName: data.agencyName || (data.role === "agent" ? "Kaduna Real Estate Partners" : undefined),
      accreditation: data.accreditation || (data.role === "agent" ? "ESVARBON / NIESV Registered" : undefined),
      mandateCount: data.role === "agent" ? 1 : undefined,
      verifiedStatus: "verified",
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);

    // Save to users DB
    try {
      const dbRaw = localStorage.getItem(USERS_DB_KEY);
      const users: UserProfile[] = dbRaw ? JSON.parse(dbRaw) : [];
      const filtered = users.filter((u) => u.email.toLowerCase() !== cleanEmail.toLowerCase());
      filtered.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(filtered));
    } catch {}
  };

  const signOut = () => {
    saveUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role: newRole,
      agencyName: newRole === "agent" ? currentUser.agencyName || `${currentUser.fullName} & Partners` : undefined,
      accreditation: newRole === "agent" ? currentUser.accreditation || "ESVARBON / NIESV Registered" : undefined,
    };
    saveUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: Boolean(currentUser),
        signIn,
        signUp,
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
