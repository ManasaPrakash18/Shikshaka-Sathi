export type SchoolStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REVOKED';

export type UserRole = 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'FACULTY';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

export type StudentStatus = 'ACTIVE' | 'TRANSFERRED' | 'PROMOTED';

export type CategoryType = 'SC' | 'ST' | 'OBC' | 'GM';

export type AssessmentType = 'FA1' | 'FA2' | 'SA1' | 'FA3' | 'FA4' | 'SA2';

export type GradeValue = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'NC';

export type ResultClassification = 'FCD' | 'FC' | 'SC' | 'Pass' | 'Fail';

export interface School {
  id: string;
  udise: string;
  name: string;
  name_kannada?: string;
  hm_name: string;
  hm_name_kannada?: string;
  hm_phone: string;
  email?: string;
  taluk: string;
  taluk_kannada?: string;
  district: string;
  district_kannada?: string;
  state: string;
  description: string;
  description_kannada?: string;
  status: SchoolStatus;
  current_academic_year: string;
  working_days_by_year?: Record<string, number>;
  registration_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolAccessHistory {
  id: string;
  school_id: string;
  action: 'REGISTER' | 'APPROVE' | 'REVOKE' | 'REACTIVATE' | 'EXTEND';
  reason?: string;
  performed_by: string;
  timestamp: string;
}

export interface User {
  id: string;
  school_id?: string;
  role: UserRole;
  name: string;
  name_kannada?: string;
  phone: string;
  email?: string;
  designation?: 'Headmaster' | 'Teacher' | 'Senior Teacher' | 'Physical Education Teacher' | 'Special Teacher';
  designation_kannada?: string;
  status: UserStatus;
  activation_token?: string;
  token_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface FacultyAssignment {
  id: string;
  faculty_id: string;
  school_id: string;
  academic_year: string;
  class_number: number;
  section: string;
  subject_name: string;
  is_class_teacher?: boolean;
}

export interface Student {
  id: string;
  school_id: string;
  academic_year: string;
  admission_no: string;
  sats_no?: string;
  pen_no: string;
  apaar_id?: string;
  aadhaar_no: string; // masked on lists
  name: string;
  name_kannada?: string;
  gender: 'BOY' | 'GIRL' | 'OTHER';
  dob: string; // YYYY-MM-DD
  religion: string;
  category: CategoryType;
  caste: string;
  caste_kannada?: string;
  sub_caste?: string;
  father_name: string;
  father_name_kannada?: string;
  mother_name: string;
  mother_name_kannada?: string;
  cwsn: boolean;
  mobile: string;
  class_number: number;
  section: string;
  place_of_birth: string;
  place_of_birth_kannada?: string;
  taluk: string;
  taluk_kannada?: string;
  district: string;
  district_kannada?: string;
  state: string;
  nationality: string;
  medium_of_instruction: string;
  admission_date: string;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentAuditLog {
  id: string;
  student_id: string;
  school_id: string;
  field_name: string;
  previous_value: string;
  updated_value: string;
  reason: string;
  updated_by: string;
  timestamp: string;
}

export interface StudentPromotionRecord {
  id: string;
  school_id: string;
  from_year: string;
  to_year: string;
  student_id: string;
  student_name: string;
  from_class: number;
  to_class: number;
  status: 'PROMOTED' | 'RETAINED' | 'GRADUATED';
  promoted_by: string;
  timestamp: string;
}

// Assessment Marks Models
export interface PrimaryFAComponents {
  gruha_pata: number; // Max 10
  ghataka_pareekshe: number; // Max 10
  yojana_karya: number; // Max 10
  chatuvatike: number; // Max 10
  bhagavahisuvike: number; // Max 10
  total_raw: number; // Max 50
  converted_fa: number; // Max 15 (Classes 1-5) or Max 10 (Classes 6-8)
}

export interface PrimarySAMarks {
  written: number; // Max 40
  oral: number; // Max 10
  total_raw: number; // Max 50
  converted_sa: number; // Max 20 (Classes 1-5) or Max 30 (Classes 6-8)
}

export interface HighSchoolActivityStandard {
  standard_no: number;
  marks: number;
  max_marks: number;
}

export interface HighSchoolFAActivity {
  standards_count: number; // 2 to 5
  standards: HighSchoolActivityStandard[];
  total_marks: number; // Max 15
}

export interface HighSchoolFAMarks {
  activity_1: HighSchoolFAActivity;
  activity_2: HighSchoolFAActivity;
  sadhana_pareekshe: number; // Max 20
  total_fa: number; // Max 50
}

export interface AssessmentRecord {
  id: string;
  school_id: string;
  academic_year: string;
  student_id: string;
  class_number: number;
  section: string;
  subject_name: string;
  assessment_type: AssessmentType;
  // Detail structures based on class
  primary_fa?: PrimaryFAComponents;
  primary_sa?: PrimarySAMarks;
  high_school_fa?: HighSchoolFAMarks;
  high_school_sa?: number; // 100 for First Lang, 80 for remaining
  total_marks: number;
  max_marks: number;
  grade: GradeValue;
  attendance_count?: number;
  updated_by: string;
  updated_at: string;
}

export interface CoCurricularGradeRecord {
  id: string;
  school_id: string;
  student_id: string;
  academic_year: string;
  class_number: number;
  daihika_arogya: GradeValue; // Daihika Mattu Arogya Shikshana
  moulya: GradeValue; // Moulya Shikshana
  kaaryanubhava: GradeValue; // Kaaryanubhava
  kala: GradeValue; // Kala Shikshana
  updated_by: string;
  updated_at: string;
}

export interface TransferCertificate {
  id: string;
  tc_no: string;
  school_id: string;
  student_id: string;
  academic_year: string;
  sanchita_dakhale_no: string;
  student_name: string;
  place_of_birth: string;
  taluk: string;
  district: string;
  state: string;
  gender: string;
  nationality: string;
  religion: string;
  caste: string;
  sub_caste: string;
  category: CategoryType;
  father_name: string;
  mother_name: string;
  whether_promoted: string;
  dob: string;
  class_studying: number;
  medium_of_teaching: string;
  date_of_admission: string;
  whether_fees_paid: string;
  fee_discount: string;
  scholarship: string;
  medical_test_info: string;
  last_attendance_date: string;
  tc_application_date: string;
  tc_issue_date: string;
  total_working_days: number;
  days_attended: number;
  behaviour: string;
  sats_no?: string;
  pen_no: string;
  apaar_id: string;
  aadhaar_no: string;
  student_name_kannada?: string;
  father_name_kannada?: string;
  mother_name_kannada?: string;
  language?: 'EN' | 'KN';
  status: 'DRAFT' | 'FINALIZED';
  created_at: string;
  updated_at: string;
}

export interface StudyCertificate {
  id: string;
  certificate_no: string;
  school_id: string;
  student_id: string;
  student_name: string;
  student_name_kannada?: string;
  father_name: string;
  father_name_kannada?: string;
  place: string;
  taluk: string;
  district: string;
  status_type: 'Currently Studying' | 'Passed Out';
  dob: string;
  place_of_birth: string;
  caste: string;
  admission_no: string;
  sats_no?: string;
  pen_no: string;
  class_studying: number;
  academic_year: string;
  issue_date: string;
  place_of_issue: string;
  language: 'EN' | 'KN';
  created_at: string;
}

export interface FormerStudent {
  id: string;
  school_id: string;
  student_id: string;
  original_admission_no: string;
  student_name: string;
  student_name_kannada?: string;
  tc_id: string;
  tc_no: string;
  transfer_date: string;
  class_at_transfer: number;
  academic_year: string;
  reason: string;
  reason_kannada?: string;
  correction_history: {
    field: string;
    old_value: string;
    new_value: string;
    reason: string;
    approver: string;
    approved_at: string;
  }[];
}

export interface AcademicCalendarEvent {
  id: string;
  school_id: string;
  academic_year: string;
  title: string;
  title_kannada?: string;
  description?: string;
  description_kannada?: string;
  date: string; // YYYY-MM-DD
  end_date?: string;
  category: 'GOVT_HOLIDAY' | 'NATIONAL_HOLIDAY' | 'SCHOOL_HOLIDAY' | 'LOCAL_HOLIDAY' | 'SCHOOL_EVENT' | 'EXAM' | 'ACADEMIC_ACTIVITY';
  is_official: boolean;
  created_by?: string;
}

export interface SchoolAchievement {
  id: string;
  school_id: string;
  academic_year: string;
  title: string;
  title_kannada?: string;
  category: 'Sports' | 'Pratibha Karanji' | 'INSPIRE Awards' | 'Competitive Examinations' | 'Other';
  student_name: string;
  student_name_kannada?: string;
  class_number: number;
  description: string;
  description_kannada?: string;
  date: string;
  photo_url?: string;
}

export interface ConstructionWork {
  id: string;
  school_id: string;
  academic_year: string;
  title: string;
  title_kannada?: string;
  description: string;
  description_kannada?: string;
  date: string;
  estimated_cost?: number;
  completion_status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  photo_url?: string;
}

export interface SDMCMeeting {
  id: string;
  school_id: string;
  academic_year: string;
  title: string;
  title_kannada?: string;
  date: string;
  agenda: string;
  agenda_kannada?: string;
  summary: string;
  summary_kannada?: string;
  decisions_taken: string;
  decisions_taken_kannada?: string;
  attachment_url?: string;
}

export interface SchoolGalleryItem {
  id: string;
  school_id: string;
  academic_year: string;
  title: string;
  title_kannada?: string;
  description: string;
  description_kannada?: string;
  date: string;
  photos: string[];
}

export interface SyncOperation {
  op_id: string;
  idempotency_key: string;
  school_id: string;
  user_id: string;
  entity_type: 'students' | 'marks' | 'cocurricular' | 'calendar' | 'school' | 'achievements' | 'faculty' | 'tc' | 'study_cert' | 'former_students' | 'audit_logs';
  record_id: string;
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retry_count: number;
  error_message?: string;
}

export type SyncState = 'SAVING' | 'SAVED_LOCAL' | 'SYNCED_CLOUD' | 'WAITING_INTERNET' | 'SYNC_FAILED';
