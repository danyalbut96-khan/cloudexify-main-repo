export type InternDomain =
  | 'Python Programming'
  | 'C++ Programming'
  | 'Java Programming'
  | 'Data Science & AI Basics'
  | 'Cybersecurity Fundamentals'
  | 'Full Stack Development';

export interface Intern {
  id: string;
  registration_number: string;
  full_name: string;
  email: string;
  whatsapp?: string;
  gender?: string;
  university?: string;
  semester?: number;
  domain: InternDomain;
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  available_hours?: number;
  referral_source?: string;
  city?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  created_at: string;
  intern_documents?: InternDocuments;
}

export interface Task {
  id: string;
  batch_id: string;
  domain: string;
  duration_label: string;
  title: string;
  description?: string;
  file_url?: string;
  created_at: string;
}

export interface InternDocuments {
  id: string;
  intern_id: string;
  offer_letter_generated: boolean;
  offer_letter_date?: string;
  offer_letter_number?: string;
  offer_letter_generated_at?: string;
  offer_letter_generated_by?: string;
  certificate_generated: boolean;
  certificate_date?: string;
  experience_certificate_generated: boolean;
  experience_certificate_date?: string;
  recommendation_letter_generated: boolean;
  recommendation_letter_date?: string;
}

export type DocumentType =
  | 'offer_letter'
  | 'certificate'
  | 'experience_certificate'
  | 'recommendation_letter';

export interface DocumentVerification {
  id: string;
  document_type: DocumentType;
  document_number: string;
  intern_id: string;
  intern_name: string;
  intern_domain: string;
  generated_at: string;
  generated_by: string;
  offer_letter_url?: string;
}

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
  joining_date: string;
  status: 'active' | 'terminated' | 'resigned' | 'on_leave';
  created_at: string;
  employee_documents?: EmployeeDocuments;
}

export interface EmployeeDocuments {
  id: string;
  employee_id: string;
  offer_letter_generated: boolean;
  appointment_letter_generated: boolean;
  experience_certificate_generated: boolean;
}

export interface Project {
  id: string;
  project_name: string;
  client_name: string;
  status: 'inquiry' | 'in_progress' | 'completed';
  start_date?: string;
  end_date?: string;
  value_pkr: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  client_name: string;
  client_email: string;
  proposal_title: string;
  description?: string;
  scope_of_work?: string;
  timeline?: string;
  estimated_cost: number;
  sent_by: string;
  sent_date?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  client_name: string;
  client_email: string;
  project_name: string;
  invoice_number: string;
  line_items: InvoiceLineItem[];
  amount_pkr: number;
  generated_by: string;
  generated_date: string;
  status: 'unpaid' | 'paid';
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  timestamp: string;
}

export interface CompanySettings {
  id: number;
  company_name: string;
  company_address: string;
  company_website: string;
  company_email: string;
  company_phone?: string;
  company_logo_url?: string | null;
  bank_details?: string;
  updated_at: string;
}

export interface AdminProfile {
  admin_id: string;
  display_name: string;
  avatar_url?: string | null;
  signature_url?: string | null;
  designation?: string | null;
  updated_at: string;
}

export interface AdminSignature {
  email: string;
  full_name: string;
  signature_url?: string | null;
  designation?: string | null;
  updated_at: string;
}
