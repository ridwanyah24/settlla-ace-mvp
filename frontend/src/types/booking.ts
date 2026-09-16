export interface TimeSlot {
  slot_id: string;
  time_label: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_locked: boolean;
}

export interface DaySchedule {
  date_str: string;
  day_of_week: string;
  formatted_date: string;
  visiting_hours: string;
  slots: TimeSlot[];
}

export interface ListingSlotsResponse {
  listing_id: string;
  property_title: string;
  manager_name: string;
  total_days_available: number;
  total_slots: number;
  available_slots: number;
  inspection_fee: number;
  days: DaySchedule[];
}

export interface InspectionBookingRequest {
  listing_id: string;
  date_str: string;
  slot_time: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  relocation_context?: string;
}

export interface InspectionBookingResponse {
  booking_id: string;
  listing_id: string;
  property_title: string;
  property_address: string;
  commute_badge: string;
  manager_name: string;
  manager_accreditation: string;
  manager_phone: string;
  manager_whatsapp: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  date_str: string;
  formatted_date: string;
  slot_time: string;
  inspection_fee: number;
  fee_currency: string;
  booking_status: string;
  directions: string;
  anti_scam_guarantee: string;
  created_at: string;
}
