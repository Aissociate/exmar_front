export type DossierType = 'vessel_incident' | 'container_incident' | 'vessel_evaluation';
export type DossierStatus = 'draft' | 'in_progress' | 'inspection_complete' | 'report_generated' | 'validated' | 'archived';
export type DocumentCategory = 'certificates' | 'previous_reports' | 'initial_photos' | 'correspondence' | 'other';
export type QuestionRating = 1 | 2 | 3 | 4;
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ReportStatus = 'draft' | 'finalized';
export type UserRole = 'expert' | 'assistant' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Dossier {
  id: string;
  user_id: string;
  dossier_number: string;
  type: DossierType;
  status: DossierStatus;
  vessel_name?: string;
  vessel_type?: string;
  imo_number?: string;
  flag?: string;
  port?: string;
  owner?: string;
  insurer?: string;
  incident_date?: string;
  inspection_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  dossier_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: DocumentCategory;
  uploaded_at: string;
}

export interface QuestionnaireTemplate {
  id: string;
  vessel_type: string;
  name: string;
  sections: QuestionSection[];
  created_at: string;
  updated_at: string;
}

export interface QuestionSection {
  id: string;
  name: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  description?: string;
}

export interface QuestionnaireResponse {
  id: string;
  dossier_id: string;
  template_id?: string;
  question_id: string;
  section_name: string;
  question_text: string;
  rating?: QuestionRating;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  dossier_id: string;
  response_id?: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  caption?: string;
  sort_order: number;
  created_at: string;
}

export interface AudioComment {
  id: string;
  dossier_id: string;
  response_id?: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  duration: number;
  transcription?: string;
  transcription_status: TranscriptionStatus;
  created_at: string;
}

export interface Report {
  id: string;
  dossier_id: string;
  user_id: string;
  version: number;
  content?: string;
  valuation_low?: number;
  valuation_mid?: number;
  valuation_high?: number;
  valuation_justification?: string;
  prompt_used?: string;
  model_used?: string;
  status: ReportStatus;
  pdf_path?: string;
  generated_at: string;
  finalized_at?: string;
}
