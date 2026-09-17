export type UserRole = "tenant" | "agent";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
  ninNumber?: string;
  relocationContext?: string; // For tenants e.g. "NYSC Corps Member (GTBank Barnawa)"
  agencyName?: string; // For agents e.g. "HB&A Partners & Co."
  accreditation?: string; // For agents e.g. "ESVARBON / NIESV Reg. #A2840"
  mandateCount?: number;
  verifiedStatus?: "verified" | "pending" | "unverified";
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}
