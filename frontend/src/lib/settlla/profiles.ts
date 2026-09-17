import { UserProfile, UserRole } from "@/types/auth";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  nin_number: string | null;
  relocation_context: string | null;
  agency_name: string | null;
  accreditation: string | null;
  mandate_count: number | null;
  verified_status: string | null;
  created_at: string;
};

export function profileRowToUser(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phoneNumber: row.phone_number || "0803 123 4567",
    role: row.role,
    ninNumber: row.nin_number || undefined,
    relocationContext: row.relocation_context || undefined,
    agencyName: row.agency_name || undefined,
    accreditation: row.accreditation || undefined,
    mandateCount: row.mandate_count ?? undefined,
    verifiedStatus: (row.verified_status as UserProfile["verifiedStatus"]) || "verified",
    createdAt: row.created_at,
  };
}
