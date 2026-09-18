import { loadStoredAgreements } from "./localStore";

export async function fetchPendingSignatureCount(): Promise<number> {
  return loadStoredAgreements().filter((a) => a.status === "tenant_signed").length;
}

export async function fetchPendingAgreements(): Promise<unknown[]> {
  return loadStoredAgreements().filter((a) =>
    ["tenant_signed", "fully_executed", "draft_ready_for_signature"].includes(a.status)
  );
}
