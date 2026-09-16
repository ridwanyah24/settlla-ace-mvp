export interface PaymentSplitBreakdown {
  annual_rent_escrow: number;
  caution_deposit_vault: number;
  property_agency_fee: number;
  legal_drafting_fee: number;
  total_move_in_amount: number;
  escrow_percentage: number;
  caution_percentage: number;
  agency_percentage: number;
  legal_percentage: number;
  agency_subaccount?: string;
  legal_subaccount?: string;
  caution_vault_account?: string;
  escrow_account?: string;
}

export interface MoveInDisputeRecord {
  dispute_id: string;
  escrow_id: string;
  agreement_id: string;
  listing_id: string;
  tenant_name: string;
  issue_category: "key_failure" | "access_denied" | "property_misrepresentation" | "unauthorized_occupants" | string;
  description: string;
  evidence_urls: string[];
  reporter_phone?: string;
  date_logged: string;
  dispute_status: "open_frozen" | "investigating" | "resolved_refunded" | "resolved_cleared";
  admin_verdict?: string | null;
  refund_reference?: string | null;
  resolution_notes?: string | null;
  indemnity_seal: string;
}

export interface EscrowHoldRecord {
  escrow_id: string;
  transaction_id: string;
  agreement_id: string;
  listing_id: string;
  tenant_name: string;
  landlord_name: string;
  landlord_bank_name: string;
  landlord_account_num: string;
  amount_held: number;
  currency: string;
  scheduled_move_in: string;
  auto_release_at: string;
  escrow_status: "holding" | "released" | "disputed_frozen" | "refunded";
  confirmed_by_tenant: boolean;
  confirmed_at?: string | null;
  dispute_active: boolean;
  release_reason?: "tenant_button" | "auto_timer_24h" | "admin_override" | string | null;
  disbursement_ref?: string | null;
  timer_paused?: boolean;
  active_dispute?: MoveInDisputeRecord | null;
  guarantee_seal: string;
  created_at: string;
}

export interface CautionVaultRecord {
  caution_id: string;
  transaction_id: string;
  agreement_id: string;
  amount: number;
  currency: string;
  vault_account: string;
  vault_status: string;
  tenure_months: number;
  refundable_date: string;
  refund_conditions: string;
  created_at: string;
}

export interface MoveInPass {
  pass_id: string;
  transaction_id: string;
  agreement_id: string;
  listing_id: string;
  tenant_name: string;
  tenant_phone: string;
  property_title: string;
  property_address: string;
  scheduled_move_in_date: string;
  manager_name: string;
  manager_phone: string;
  manager_accreditation: string;
  mandate_ref: string;
  qr_token: string;
  verification_hash: string;
  status: string;
  escrow_status: string;
  instructions: string;
  created_at: string;
}

export interface SettlementDisbursal {
  recipient_role: string;
  recipient_name: string;
  account_destination: string;
  percentage: number;
  amount_ngn: number;
  purpose: string;
  settlement_status: string;
}

export interface PaymentTransaction {
  transaction_id: string;
  agreement_id: string;
  listing_id: string;
  tenant_name: string;
  total_amount_paid: number;
  currency: string;
  payment_gateway: "Paystack" | "Monnify";
  gateway_ref: string;
  payment_channel: "card" | "bank_transfer" | "ussd";
  split_breakdown: PaymentSplitBreakdown;
  settlement_disbursals?: SettlementDisbursal[];
  payment_status: "successful" | "pending" | "failed";
  paid_at: string;
  escrow_hold: EscrowHoldRecord;
  caution_vault: CautionVaultRecord;
  move_in_pass: MoveInPass;
  receipt_url?: string;
}

export interface PaymentInitiateResponse {
  status: string;
  agreement_id: string;
  listing_id: string;
  property_title: string;
  tenant_name: string;
  tenant_email: string;
  total_amount: number;
  currency: string;
  payment_gateway: string;
  payment_channel: string;
  gateway_ref: string;
  split_breakdown: PaymentSplitBreakdown;
  virtual_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
    expires_in_minutes: number;
  };
  ussd_string?: string;
  escrow_guarantee: string;
}
