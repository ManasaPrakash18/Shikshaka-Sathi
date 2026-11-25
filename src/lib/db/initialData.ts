import {
  School,
  User,
  Student,
  AssessmentRecord,
  CoCurricularGradeRecord,
  AcademicCalendarEvent,
  SchoolAchievement,
  ConstructionWork,
  SDMCMeeting,
  SchoolGalleryItem,
  FacultyAssignment,
  TransferCertificate,
  FormerStudent,
} from '../types';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'school-1',
    udise: '29260100102',
    name: 'Government High School Vidyaranyapuram',
    name_kannada: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ವಿದ್ಯಾರಣ್ಯಪುರಂ',
    hm_name: 'Ramesh Gowda',
    hm_name_kannada: 'ರಮೇಶ್ ಗೌಡ',
    hm_phone: '9845123456',
    email: 'ghs.vidyaranyapuram@karnataka.gov.in',
    taluk: 'Mysuru South',
    taluk_kannada: 'ಮೈಸೂರು ದಕ್ಷಿಣ',
    district: 'Mysuru',
    district_kannada: 'ಮೈಸೂರು',
    state: 'Karnataka',
    description: 'A premier government secondary school established in 1968, committed to holistic CCE education, smart classrooms, and state-level science & sports achievements.',
    status: 'ACTIVE',
    current_academic_year: '2026-27',
    registration_date: '2023-05-10',
    expiry_date: '2026-05-31',
    created_at: '2023-05-10T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'school-2',
    udise: '29200401201',
    name: 'Government Model Higher Primary School Hassan',
    name_kannada: 'ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ ಹಾಸನ',
    hm_name: 'Savitha K',
    hm_name_kannada: 'ಸವಿತಾ ಕೆ',
    hm_phone: '9845789123',
    email: 'gmhps.hassan@karnataka.gov.in',
    taluk: 'Hassan Urban',
    taluk_kannada: 'ಹಾಸನ ನಗರ',
    district: 'Hassan',
    district_kannada: 'ಹಾಸನ',
    state: 'Karnataka',
    description: 'Model primary school providing joyful child-centric Nali-Kali and CCE education from Classes 1 to 7 with modern computer labs and mid-day meal nutrition.',
    status: 'ACTIVE',
    current_academic_year: '2026-27',
    registration_date: '2023-06-15',
    expiry_date: '2026-05-31',
    created_at: '2023-06-15T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'school-3',
    udise: '29210204509',
    name: 'Government High School Doddaballapura',
    name_kannada: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ ದೊಡ್ಡಬಳ್ಳಾಪುರ',
    hm_name: 'Manjunath Swamy',
    hm_name_kannada: 'ಮಂಜುನಾಥ ಸ್ವಾಮಿ',
    hm_phone: '9880112233',
    email: 'ghs.doddaballapura@karnataka.gov.in',
    taluk: 'Doddaballapura',
    taluk_kannada: 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
    district: 'Bangalore Rural',
    district_kannada: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
    state: 'Karnataka',
    description: 'Rural high school aiming to modernize CCE records and student tracking.',
    status: 'PENDING_APPROVAL',
    current_academic_year: '2026-27',
    registration_date: '2024-10-20',
    created_at: '2024-10-20T11:00:00Z',
    updated_at: '2024-10-20T11:00:00Z',
  },
  {
    id: 'school-4',
    udise: '29220302105',
    name: 'Government Higher Primary School Channapatna',
    name_kannada: 'ಸರ್ಕಾರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ ಚನ್ನಪಟ್ಟಣ',
    hm_name: 'Nagaraju B',
    hm_name_kannada: 'ನಾಗರಾಜು ಬಿ',
    hm_phone: '9448102938',
    email: 'ghps.channapatna@karnataka.gov.in',
    taluk: 'Channapatna',
    taluk_kannada: 'ಚನ್ನಪಟ್ಟಣ',
    district: 'Ramanagara',
    district_kannada: 'ರಾಮನಗರ',
    state: 'Karnataka',
    description: 'Higher primary school temporarily revoked for administrative audit.',
    status: 'REVOKED',
    current_academic_year: '2026-27',
    registration_date: '2022-04-12',
    expiry_date: '2024-03-31',
    created_at: '2022-04-12T09:00:00Z',
    updated_at: '2024-04-01T10:00:00Z',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-platform-admin',
    role: 'PLATFORM_ADMIN',
    name: 'H Prakash',
    name_kannada: 'ಎಚ್. ಪ್ರಕಾಶ್',
    phone: '9900011122',
    email: 'admin@karnataka.gov.in',
    designation: 'Headmaster',
    status: 'ACTIVE',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user-hm-mysuru',
    school_id: 'school-1',
    role: 'SCHOOL_ADMIN',
    name: 'Ramesh Gowda',
    name_kannada: 'ರಮೇಶ್ ಗೌಡ',
    phone: '9845123456',
    email: 'ramesh.gowda@ghs-mysuru.in',
    designation: 'Headmaster',
    status: 'ACTIVE',
    created_at: '2023-05-10T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'user-faculty-1',
    school_id: 'school-1',
    role: 'FACULTY',
    name: 'Smt. Anasuya M',
    name_kannada: 'ಶ್ರೀಮತಿ ಅನಸೂಯ ಎಂ',
    phone: '9845223344',
    email: 'anasuya.m@ghs-mysuru.in',
    designation: 'Senior Teacher',
    status: 'ACTIVE',
    created_at: '2023-06-01T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'user-faculty-2',
    school_id: 'school-1',
    role: 'FACULTY',
    name: 'Sri Shivakumar B',
    name_kannada: 'ಶ್ರೀ ಶಿವಕುಮಾರ್ ಬಿ',
    phone: '9845334455',
    email: 'shivakumar.b@ghs-mysuru.in',
    designation: 'Teacher',
    status: 'ACTIVE',
    created_at: '2023-06-01T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'user-hm-hassan',
    school_id: 'school-2',
    role: 'SCHOOL_ADMIN',
    name: 'Savitha K',
    name_kannada: 'ಸವಿತಾ ಕೆ',
    phone: '9845789123',
    email: 'savitha.k@gmhps-hassan.in',
    designation: 'Headmaster',
    status: 'ACTIVE',
    created_at: '2023-06-15T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'user-faculty-hassan',
    school_id: 'school-2',
    role: 'FACULTY',
    name: 'Sri Manjunath H',
    name_kannada: 'ಶ್ರೀ ಮಂಜುನಾಥ್ ಎಚ್',
    phone: '9845889900',
    email: 'manjunath.h@gmhps-hassan.in',
    designation: 'Teacher',
    status: 'ACTIVE',
    created_at: '2023-06-20T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
];

export const INITIAL_FACULTY_ASSIGNMENTS: FacultyAssignment[] = [
  {
    id: 'fa-1',
    faculty_id: 'user-faculty-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    class_number: 10,
    section: 'A',
    subject_name: 'Mathematics',
    is_class_teacher: true,
  },
  {
    id: 'fa-2',
    faculty_id: 'user-faculty-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    class_number: 10,
    section: 'A',
    subject_name: 'Science',
    is_class_teacher: false,
  },
  {
    id: 'fa-3',
    faculty_id: 'user-faculty-2',
    school_id: 'school-1',
    academic_year: '2026-27',
    class_number: 8,
    section: 'A',
    subject_name: 'First Language (Kannada)',
    is_class_teacher: true,
  },
  {
    id: 'fa-4',
    faculty_id: 'user-faculty-hassan',
    school_id: 'school-2',
    academic_year: '2026-27',
    class_number: 5,
    section: 'A',
    subject_name: 'First Language (Kannada)',
    is_class_teacher: true,
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // High School Students (School 1 - Vidyaranyapuram)
  {
    id: 'std-10-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    admission_no: 'ADM/2021/045',
    sats_no: '109823456',
    pen_no: 'PEN2024KA1001',
    apaar_id: 'APAAR99881122',
    aadhaar_no: '5421-8745-9812',
    name: 'Prajwal Kumar M',
    gender: 'BOY',
    dob: '2009-04-14',
    religion: 'Hindu',
    category: 'OBC',
    caste: 'Kuruba',
    sub_caste: 'Halumatha',
    father_name: 'Mahadevaiah K',
    mother_name: 'Geetha M',
    cwsn: false,
    mobile: '9845012345',
    class_number: 10,
    section: 'A',
    place_of_birth: 'Mysuru',
    taluk: 'Mysuru South',
    district: 'Mysuru',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2021-06-10',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'std-10-2',
    school_id: 'school-1',
    academic_year: '2026-27',
    admission_no: 'ADM/2021/048',
    sats_no: '109823459',
    pen_no: 'PEN2024KA1002',
    apaar_id: 'APAAR99881123',
    aadhaar_no: '6543-2198-4321',
    name: 'Bhumika S Gowda',
    gender: 'GIRL',
    dob: '2009-08-22',
    religion: 'Hindu',
    category: 'GM',
    caste: 'Vokkaliga',
    sub_caste: 'Gangatkar',
    father_name: 'Suresh Gowda',
    mother_name: 'Parvathamma',
    cwsn: false,
    mobile: '9845023456',
    class_number: 10,
    section: 'A',
    place_of_birth: 'Nanjangud',
    taluk: 'Nanjangud',
    district: 'Mysuru',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2021-06-12',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'std-10-3',
    school_id: 'school-1',
    academic_year: '2026-27',
    admission_no: 'ADM/2021/052',
    sats_no: '109823462',
    pen_no: 'PEN2024KA1003',
    apaar_id: 'APAAR99881124',
    aadhaar_no: '4321-8765-1234',
    name: 'Kavitha R',
    gender: 'GIRL',
    dob: '2009-11-05',
    religion: 'Hindu',
    category: 'SC',
    caste: 'Adi Karnataka',
    sub_caste: 'AK',
    father_name: 'Ramu N',
    mother_name: 'Lakshmi',
    cwsn: false,
    mobile: '9845034567',
    class_number: 10,
    section: 'A',
    place_of_birth: 'T. Narasipura',
    taluk: 'T. Narasipura',
    district: 'Mysuru',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2021-06-15',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'std-10-4',
    school_id: 'school-1',
    academic_year: '2026-27',
    admission_no: 'ADM/2021/059',
    sats_no: '109823470',
    pen_no: 'PEN2024KA1004',
    apaar_id: 'APAAR99881125',
    aadhaar_no: '7890-1234-5678',
    name: 'Chandan Nayak',
    gender: 'BOY',
    dob: '2009-02-18',
    religion: 'Hindu',
    category: 'ST',
    caste: 'Nayaka',
    sub_caste: 'Valmiki',
    father_name: 'Nagaraju Nayak',
    mother_name: 'Sarvamangala',
    cwsn: false,
    mobile: '9845045678',
    class_number: 10,
    section: 'A',
    place_of_birth: 'Hunsur',
    taluk: 'Hunsur',
    district: 'Mysuru',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2021-06-16',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'std-9-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    admission_no: 'ADM/2022/031',
    sats_no: '109824101',
    pen_no: 'PEN2024KA0901',
    apaar_id: 'APAAR99882201',
    aadhaar_no: '8877-6655-4433',
    name: 'Darshan B R',
    gender: 'BOY',
    dob: '2010-05-19',
    religion: 'Hindu',
    category: 'OBC',
    caste: 'Idiga',
    father_name: 'Ramesh B',
    mother_name: 'Sharadamma',
    cwsn: false,
    mobile: '9845056789',
    class_number: 9,
    section: 'A',
    place_of_birth: 'Mysuru',
    taluk: 'Mysuru South',
    district: 'Mysuru',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2022-06-10',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'std-8-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    admission_no: 'ADM/2023/020',
    sats_no: '109825201',
    pen_no: 'PEN2024KA0801',
    apaar_id: 'APAAR99883301',
    aadhaar_no: '9988-7766-5544',
    name: 'Ananya S',
    gender: 'GIRL',
    dob: '2011-09-12',
    religion: 'Hindu',
    category: 'GM',
    caste: 'Brahmin',
    father_name: 'Shankar Dixit',
    mother_name: 'Vidya',
    cwsn: false,
    mobile: '9845067890',
    class_number: 8,
    section: 'A',
    place_of_birth: 'Mysuru',
    taluk: 'Mysuru North',
    district: 'Mysuru',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2023-06-08',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },

  // Primary School Students (School 2 - Hassan)
  {
    id: 'std-5-1',
    school_id: 'school-2',
    academic_year: '2026-27',
    admission_no: 'ADM/2020/012',
    sats_no: '108812341',
    pen_no: 'PEN2024KA0501',
    apaar_id: 'APAAR88771101',
    aadhaar_no: '3344-5566-7788',
    name: 'Tejaswini M',
    gender: 'GIRL',
    dob: '2014-03-10',
    religion: 'Hindu',
    category: 'SC',
    caste: 'Madiga',
    father_name: 'Manjunatha',
    mother_name: 'Pushpa',
    cwsn: false,
    mobile: '9845112233',
    class_number: 5,
    section: 'A',
    place_of_birth: 'Hassan',
    taluk: 'Hassan Urban',
    district: 'Hassan',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2020-06-05',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'std-5-2',
    school_id: 'school-2',
    academic_year: '2026-27',
    admission_no: 'ADM/2020/015',
    sats_no: '108812345',
    pen_no: 'PEN2024KA0502',
    apaar_id: 'APAAR88771102',
    aadhaar_no: '4455-6677-8899',
    name: 'Kiran Gowda',
    gender: 'BOY',
    dob: '2014-07-25',
    religion: 'Hindu',
    category: 'OBC',
    caste: 'Vokkaliga',
    father_name: 'Shivananje Gowda',
    mother_name: 'Kusuma',
    cwsn: false,
    mobile: '9845223344',
    class_number: 5,
    section: 'A',
    place_of_birth: 'Alur',
    taluk: 'Alur',
    district: 'Hassan',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2020-06-08',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'std-1-1',
    school_id: 'school-2',
    academic_year: '2026-27',
    admission_no: 'ADM/2024/001',
    sats_no: '108855661',
    pen_no: 'PEN2024KA0101',
    apaar_id: 'APAAR88775501',
    aadhaar_no: '1122-3344-5566',
    name: 'Sneha K',
    gender: 'GIRL',
    dob: '2018-06-02',
    religion: 'Hindu',
    category: 'ST',
    caste: 'Jenu Kuruba',
    father_name: 'Kumar',
    mother_name: 'Mangala',
    cwsn: false,
    mobile: '9845334455',
    class_number: 1,
    section: 'A',
    place_of_birth: 'Hassan',
    taluk: 'Hassan Rural',
    district: 'Hassan',
    state: 'Karnataka',
    nationality: 'Indian',
    medium_of_instruction: 'Kannada',
    admission_date: '2024-06-01',
    status: 'ACTIVE',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
];

export const INITIAL_ASSESSMENT_RECORDS: AssessmentRecord[] = [
  {
    "id": "mrk-std-10-1-fir-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 39.5
    },
    "total_marks": 39.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-fir-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-fir-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA1",
    "high_school_sa": 83,
    "total_marks": 83,
    "max_marks": 100,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-fir-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 40.5
    },
    "total_marks": 40.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-fir-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "sadhana_pareekshe": 17.5,
      "total_fa": 44.5
    },
    "total_marks": 44.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-fir-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA2",
    "high_school_sa": 83,
    "total_marks": 83,
    "max_marks": 100,
    "grade": "A",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sec-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sec-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 40.5
    },
    "total_marks": 40.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sec-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA1",
    "high_school_sa": 69,
    "total_marks": 69,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sec-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "sadhana_pareekshe": 17.5,
      "total_fa": 44.5
    },
    "total_marks": 44.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sec-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 5,
            "max_marks": 5
          }
        ],
        "total_marks": 14
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 5,
            "max_marks": 5
          }
        ],
        "total_marks": 14
      },
      "sadhana_pareekshe": 18,
      "total_fa": 46
    },
    "total_marks": 46,
    "max_marks": 50,
    "grade": "A+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sec-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA2",
    "high_school_sa": 69,
    "total_marks": 69,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-thi-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 5,
            "max_marks": 5
          }
        ],
        "total_marks": 14
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 5,
            "max_marks": 5
          }
        ],
        "total_marks": 14
      },
      "sadhana_pareekshe": 18,
      "total_fa": 46
    },
    "total_marks": 46,
    "max_marks": 50,
    "grade": "A+",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-thi-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 17,
      "total_fa": 43
    },
    "total_marks": 43,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-thi-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA1",
    "high_school_sa": 63,
    "total_marks": 63,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-thi-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 39.5
    },
    "total_marks": 39.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-thi-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-thi-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA2",
    "high_school_sa": 63,
    "total_marks": 63,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-mat-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 41
    },
    "total_marks": 41,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-mat-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-mat-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA1",
    "high_school_sa": 66,
    "total_marks": 66,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-mat-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 39
    },
    "total_marks": 39,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-mat-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 42.5
    },
    "total_marks": 42.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-mat-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA2",
    "high_school_sa": 66,
    "total_marks": 66,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sci-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16,
      "total_fa": 40
    },
    "total_marks": 40,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sci-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 17.5,
      "total_fa": 43.5
    },
    "total_marks": 43.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sci-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA1",
    "high_school_sa": 68,
    "total_marks": 68,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sci-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 5,
            "max_marks": 5
          }
        ],
        "total_marks": 14
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 5,
            "max_marks": 5
          }
        ],
        "total_marks": 14
      },
      "sadhana_pareekshe": 18,
      "total_fa": 46
    },
    "total_marks": 46,
    "max_marks": 50,
    "grade": "A+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sci-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "sadhana_pareekshe": 17.5,
      "total_fa": 44.5
    },
    "total_marks": 44.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-sci-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA2",
    "high_school_sa": 68,
    "total_marks": 68,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-soc-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 42.5
    },
    "total_marks": 42.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-soc-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "sadhana_pareekshe": 18.5,
      "total_fa": 45.5
    },
    "total_marks": 45.5,
    "max_marks": 50,
    "grade": "A+",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-soc-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA1",
    "high_school_sa": 66,
    "total_marks": 66,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-soc-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 13.5
      },
      "sadhana_pareekshe": 18.5,
      "total_fa": 45.5
    },
    "total_marks": 45.5,
    "max_marks": 50,
    "grade": "A+",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-soc-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 17,
      "total_fa": 42
    },
    "total_marks": 42,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-1-soc-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-1",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA2",
    "high_school_sa": 66,
    "total_marks": 66,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-fir-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 15,
      "total_fa": 37
    },
    "total_marks": 37,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-fir-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14,
      "total_fa": 36
    },
    "total_marks": 36,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-fir-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA1",
    "high_school_sa": 79,
    "total_marks": 79,
    "max_marks": 100,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-fir-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 38.5
    },
    "total_marks": 38.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-fir-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 17,
      "total_fa": 42
    },
    "total_marks": 42,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-fir-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA2",
    "high_school_sa": 79,
    "total_marks": 79,
    "max_marks": 100,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sec-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14,
      "total_fa": 36
    },
    "total_marks": 36,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sec-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 38.5
    },
    "total_marks": 38.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sec-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA1",
    "high_school_sa": 65,
    "total_marks": 65,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sec-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 17,
      "total_fa": 42
    },
    "total_marks": 42,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sec-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 18,
      "total_fa": 44
    },
    "total_marks": 44,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sec-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA2",
    "high_school_sa": 65,
    "total_marks": 65,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-thi-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 17.5,
      "total_fa": 43.5
    },
    "total_marks": 43.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-thi-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 41
    },
    "total_marks": 41,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-thi-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA1",
    "high_school_sa": 59,
    "total_marks": 59,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-thi-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 15,
      "total_fa": 37
    },
    "total_marks": 37,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-thi-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14,
      "total_fa": 36
    },
    "total_marks": 36,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-thi-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA2",
    "high_school_sa": 59,
    "total_marks": 59,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-mat-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 38.5
    },
    "total_marks": 38.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-mat-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14,
      "total_fa": 36
    },
    "total_marks": 36,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-mat-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA1",
    "high_school_sa": 62,
    "total_marks": 62,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-mat-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 15,
      "total_fa": 37
    },
    "total_marks": 37,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-mat-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 40.5
    },
    "total_marks": 40.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-mat-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA2",
    "high_school_sa": 62,
    "total_marks": 62,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sci-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sci-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 41.5
    },
    "total_marks": 41.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sci-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA1",
    "high_school_sa": 65,
    "total_marks": 65,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sci-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 18,
      "total_fa": 44
    },
    "total_marks": 44,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sci-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 42.5
    },
    "total_marks": 42.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-sci-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA2",
    "high_school_sa": 65,
    "total_marks": 65,
    "max_marks": 80,
    "grade": "A",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-soc-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 40.5
    },
    "total_marks": 40.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-soc-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 17.5,
      "total_fa": 43.5
    },
    "total_marks": 43.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-soc-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA1",
    "high_school_sa": 63,
    "total_marks": 63,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-soc-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 13
      },
      "sadhana_pareekshe": 17,
      "total_fa": 43
    },
    "total_marks": 43,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-soc-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16,
      "total_fa": 40
    },
    "total_marks": 40,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-2-soc-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-2",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA2",
    "high_school_sa": 63,
    "total_marks": 63,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-fir-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13,
      "total_fa": 33
    },
    "total_marks": 33,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-fir-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "sadhana_pareekshe": 13,
      "total_fa": 32
    },
    "total_marks": 32,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-fir-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA1",
    "high_school_sa": 71,
    "total_marks": 71,
    "max_marks": 100,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-fir-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 14,
      "total_fa": 34
    },
    "total_marks": 34,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-fir-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-fir-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA2",
    "high_school_sa": 71,
    "total_marks": 71,
    "max_marks": 100,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sec-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "sadhana_pareekshe": 13,
      "total_fa": 32
    },
    "total_marks": 32,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sec-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 14,
      "total_fa": 34
    },
    "total_marks": 34,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sec-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA1",
    "high_school_sa": 59,
    "total_marks": 59,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sec-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sec-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 39.5
    },
    "total_marks": 39.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sec-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA2",
    "high_school_sa": 59,
    "total_marks": 59,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-thi-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 39.5
    },
    "total_marks": 39.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-thi-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 36.5
    },
    "total_marks": 36.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-thi-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA1",
    "high_school_sa": 53,
    "total_marks": 53,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-thi-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13,
      "total_fa": 33
    },
    "total_marks": 33,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-thi-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "sadhana_pareekshe": 13,
      "total_fa": 32
    },
    "total_marks": 32,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-thi-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA2",
    "high_school_sa": 53,
    "total_marks": 53,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-mat-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 13.5,
      "total_fa": 34.5
    },
    "total_marks": 34.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-mat-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "sadhana_pareekshe": 13,
      "total_fa": 32
    },
    "total_marks": 32,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-mat-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA1",
    "high_school_sa": 56,
    "total_marks": 56,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-mat-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 12.5,
      "total_fa": 32.5
    },
    "total_marks": 32.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-mat-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 36.5
    },
    "total_marks": 36.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-mat-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA2",
    "high_school_sa": 56,
    "total_marks": 56,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sci-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13.5,
      "total_fa": 33.5
    },
    "total_marks": 33.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sci-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 37.5
    },
    "total_marks": 37.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sci-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA1",
    "high_school_sa": 58,
    "total_marks": 58,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sci-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 39.5
    },
    "total_marks": 39.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sci-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-sci-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA2",
    "high_school_sa": 58,
    "total_marks": 58,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-soc-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 36.5
    },
    "total_marks": 36.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-soc-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 39.5
    },
    "total_marks": 39.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-soc-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA1",
    "high_school_sa": 56,
    "total_marks": 56,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-soc-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 39
    },
    "total_marks": 39,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-soc-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 35.5
    },
    "total_marks": 35.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-3-soc-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-3",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA2",
    "high_school_sa": 56,
    "total_marks": 56,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-fir-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "sadhana_pareekshe": 12,
      "total_fa": 30
    },
    "total_marks": 30,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-fir-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "sadhana_pareekshe": 12,
      "total_fa": 29
    },
    "total_marks": 29,
    "max_marks": 50,
    "grade": "C+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-fir-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA1",
    "high_school_sa": 65,
    "total_marks": 65,
    "max_marks": 100,
    "grade": "B",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-fir-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "sadhana_pareekshe": 12,
      "total_fa": 31
    },
    "total_marks": 31,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-fir-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14,
      "total_fa": 35
    },
    "total_marks": 35,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-fir-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA2",
    "high_school_sa": 65,
    "total_marks": 65,
    "max_marks": 100,
    "grade": "B",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sec-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "sadhana_pareekshe": 12,
      "total_fa": 29
    },
    "total_marks": 29,
    "max_marks": 50,
    "grade": "C+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sec-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "sadhana_pareekshe": 12,
      "total_fa": 31
    },
    "total_marks": 31,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sec-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA1",
    "high_school_sa": 54,
    "total_marks": 54,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 64,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sec-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14,
      "total_fa": 35
    },
    "total_marks": 35,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sec-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 15,
      "total_fa": 37
    },
    "total_marks": 37,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sec-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA2",
    "high_school_sa": 54,
    "total_marks": 54,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-thi-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 36.5
    },
    "total_marks": 36.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-thi-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 14,
      "total_fa": 34
    },
    "total_marks": 34,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-thi-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA1",
    "high_school_sa": 48,
    "total_marks": 48,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-thi-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "sadhana_pareekshe": 12,
      "total_fa": 30
    },
    "total_marks": 30,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-thi-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "sadhana_pareekshe": 12,
      "total_fa": 29
    },
    "total_marks": 29,
    "max_marks": 50,
    "grade": "C+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-thi-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA2",
    "high_school_sa": 48,
    "total_marks": 48,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-mat-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 9.5
      },
      "sadhana_pareekshe": 12.5,
      "total_fa": 31.5
    },
    "total_marks": 31.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-mat-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 2.5,
            "max_marks": 5
          }
        ],
        "total_marks": 8.5
      },
      "sadhana_pareekshe": 12,
      "total_fa": 29
    },
    "total_marks": 29,
    "max_marks": 50,
    "grade": "C+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-mat-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA1",
    "high_school_sa": 51,
    "total_marks": 51,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-mat-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "sadhana_pareekshe": 12,
      "total_fa": 30
    },
    "total_marks": 30,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-mat-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13.5,
      "total_fa": 33.5
    },
    "total_marks": 33.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-mat-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA2",
    "high_school_sa": 51,
    "total_marks": 51,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sci-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 9
      },
      "sadhana_pareekshe": 12.5,
      "total_fa": 30.5
    },
    "total_marks": 30.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sci-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 13.5,
      "total_fa": 34.5
    },
    "total_marks": 34.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sci-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA1",
    "high_school_sa": 53,
    "total_marks": 53,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sci-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 36.5
    },
    "total_marks": 36.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sci-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 35.5
    },
    "total_marks": 35.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-sci-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA2",
    "high_school_sa": 53,
    "total_marks": 53,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-soc-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13.5,
      "total_fa": 33.5
    },
    "total_marks": 33.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-soc-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 36.5
    },
    "total_marks": 36.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-soc-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA1",
    "high_school_sa": 52,
    "total_marks": 52,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-soc-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 14,
      "total_fa": 36
    },
    "total_marks": 36,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-soc-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 12.5,
      "total_fa": 32.5
    },
    "total_marks": 32.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-4-soc-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-4",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA2",
    "high_school_sa": 52,
    "total_marks": 52,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-fir-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 13.5,
      "total_fa": 34.5
    },
    "total_marks": 34.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-fir-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13,
      "total_fa": 33
    },
    "total_marks": 33,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-fir-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA1",
    "high_school_sa": 73,
    "total_marks": 73,
    "max_marks": 100,
    "grade": "B+",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-fir-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 35.5
    },
    "total_marks": 35.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-fir-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 39
    },
    "total_marks": 39,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-fir-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA2",
    "high_school_sa": 73,
    "total_marks": 73,
    "max_marks": 100,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sec-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13,
      "total_fa": 33
    },
    "total_marks": 33,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sec-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 35.5
    },
    "total_marks": 35.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sec-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA1",
    "high_school_sa": 61,
    "total_marks": 61,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sec-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 39
    },
    "total_marks": 39,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sec-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 41
    },
    "total_marks": 41,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sec-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Second Language (English)",
    "assessment_type": "SA2",
    "high_school_sa": 61,
    "total_marks": 61,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-thi-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 41
    },
    "total_marks": 41,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-thi-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15,
      "total_fa": 38
    },
    "total_marks": 38,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-thi-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA1",
    "high_school_sa": 55,
    "total_marks": 55,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-thi-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 13.5,
      "total_fa": 34.5
    },
    "total_marks": 34.5,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-thi-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13,
      "total_fa": 33
    },
    "total_marks": 33,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-thi-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Third Language (Hindi)",
    "assessment_type": "SA2",
    "high_school_sa": 55,
    "total_marks": 55,
    "max_marks": 80,
    "grade": "B",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-mat-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 35.5
    },
    "total_marks": 35.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-mat-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 13,
      "total_fa": 33
    },
    "total_marks": 33,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 56,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-mat-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA1",
    "high_school_sa": 58,
    "total_marks": 58,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-mat-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3,
            "max_marks": 5
          }
        ],
        "total_marks": 10
      },
      "sadhana_pareekshe": 14,
      "total_fa": 34
    },
    "total_marks": 34,
    "max_marks": 50,
    "grade": "B",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-mat-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 37.5
    },
    "total_marks": 37.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 62,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-mat-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Mathematics",
    "assessment_type": "SA2",
    "high_school_sa": 58,
    "total_marks": 58,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sci-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 10.5
      },
      "sadhana_pareekshe": 14,
      "total_fa": 35
    },
    "total_marks": 35,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sci-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 38.5
    },
    "total_marks": 38.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 59,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sci-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA1",
    "high_school_sa": 60,
    "total_marks": 60,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sci-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4.5,
            "max_marks": 5
          }
        ],
        "total_marks": 12.5
      },
      "sadhana_pareekshe": 16,
      "total_fa": 41
    },
    "total_marks": 41,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 57,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sci-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 15.5,
      "total_fa": 39.5
    },
    "total_marks": 39.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 58,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-sci-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Science",
    "assessment_type": "SA2",
    "high_school_sa": 60,
    "total_marks": 60,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 63,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-soc-fa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA1",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 3.5,
            "max_marks": 5
          }
        ],
        "total_marks": 11.5
      },
      "sadhana_pareekshe": 14.5,
      "total_fa": 37.5
    },
    "total_marks": 37.5,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-soc-fa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA2",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 40.5
    },
    "total_marks": 40.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 55,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-soc-sa1",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA1",
    "high_school_sa": 58,
    "total_marks": 58,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-soc-fa3",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA3",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 4,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 12
      },
      "sadhana_pareekshe": 16.5,
      "total_fa": 40.5
    },
    "total_marks": 40.5,
    "max_marks": 50,
    "grade": "A",
    "attendance_count": 61,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-soc-fa4",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "FA4",
    "high_school_fa": {
      "activity_1": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "activity_2": {
        "standards_count": 3,
        "standards": [
          {
            "standard_no": 1,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 2,
            "marks": 3.5,
            "max_marks": 5
          },
          {
            "standard_no": 3,
            "marks": 4,
            "max_marks": 5
          }
        ],
        "total_marks": 11
      },
      "sadhana_pareekshe": 15,
      "total_fa": 37
    },
    "total_marks": 37,
    "max_marks": 50,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-09-20T10:00:00Z"
  },
  {
    "id": "mrk-std-10-5-soc-sa2",
    "school_id": "school-1",
    "academic_year": "2026-27",
    "student_id": "std-10-5",
    "class_number": 10,
    "section": "A",
    "subject_name": "Social Science",
    "assessment_type": "SA2",
    "high_school_sa": 58,
    "total_marks": 58,
    "max_marks": 80,
    "grade": "B+",
    "attendance_count": 60,
    "updated_by": "Smt. Anasuya M",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "mrk-5-1-fa1",
    "school_id": "school-2",
    "academic_year": "2026-27",
    "student_id": "std-5-1",
    "class_number": 5,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "FA1",
    "primary_fa": {
      "gruha_pata": 9,
      "ghataka_pareekshe": 9,
      "yojana_karya": 10,
      "chatuvatike": 9,
      "bhagavahisuvike": 10,
      "total_raw": 47,
      "converted_fa": 14.1
    },
    "total_marks": 14.1,
    "max_marks": 15,
    "grade": "A+",
    "attendance_count": 55,
    "updated_by": "Sri Manjunath H",
    "updated_at": "2024-07-22T10:00:00Z"
  },
  {
    "id": "mrk-5-1-sa1",
    "school_id": "school-2",
    "academic_year": "2026-27",
    "student_id": "std-5-1",
    "class_number": 5,
    "section": "A",
    "subject_name": "First Language (Kannada)",
    "assessment_type": "SA1",
    "primary_sa": {
      "written": 36,
      "oral": 9,
      "total_raw": 45,
      "converted_sa": 18
    },
    "total_marks": 18,
    "max_marks": 20,
    "grade": "A+",
    "attendance_count": 60,
    "updated_by": "Sri Manjunath H",
    "updated_at": "2024-10-12T10:00:00Z"
  }
];

export const INITIAL_CO_CURRICULAR: CoCurricularGradeRecord[] = [
  {
    "id": "cc-10-1",
    "school_id": "school-1",
    "student_id": "std-10-1",
    "academic_year": "2026-27",
    "class_number": 10,
    "daihika_arogya": "A+",
    "moulya": "A",
    "kaaryanubhava": "A",
    "kala": "A+",
    "updated_by": "Ramesh Gowda",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "cc-10-2",
    "school_id": "school-1",
    "student_id": "std-10-2",
    "academic_year": "2026-27",
    "class_number": 10,
    "daihika_arogya": "A",
    "moulya": "A+",
    "kaaryanubhava": "A",
    "kala": "A",
    "updated_by": "Ramesh Gowda",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "cc-10-3",
    "school_id": "school-1",
    "student_id": "std-10-3",
    "academic_year": "2026-27",
    "class_number": 10,
    "daihika_arogya": "A",
    "moulya": "A",
    "kaaryanubhava": "A+",
    "kala": "A",
    "updated_by": "Ramesh Gowda",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "cc-10-4",
    "school_id": "school-1",
    "student_id": "std-10-4",
    "academic_year": "2026-27",
    "class_number": 10,
    "daihika_arogya": "B+",
    "moulya": "A",
    "kaaryanubhava": "A",
    "kala": "B+",
    "updated_by": "Ramesh Gowda",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "cc-10-5",
    "school_id": "school-1",
    "student_id": "std-10-5",
    "academic_year": "2026-27",
    "class_number": 10,
    "daihika_arogya": "A",
    "moulya": "A",
    "kaaryanubhava": "A",
    "kala": "A",
    "updated_by": "Ramesh Gowda",
    "updated_at": "2024-10-15T10:00:00Z"
  },
  {
    "id": "cc-5-1",
    "school_id": "school-2",
    "student_id": "std-5-1",
    "academic_year": "2026-27",
    "class_number": 5,
    "daihika_arogya": "A",
    "moulya": "A",
    "kaaryanubhava": "A+",
    "kala": "A",
    "updated_by": "Savitha K",
    "updated_at": "2024-10-15T10:00:00Z"
  }
];

export const INITIAL_CALENDAR_EVENTS: AcademicCalendarEvent[] = [
  {
    id: 'cal-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'School Reopening & Shala Prarambhotsava',
    title_kannada: 'ಶಾಲೆ ಪ್ರಾರಂಭೋತ್ಸವ ಮತ್ತು ಪಠ್ಯಪುಸ್ತಕ ವಿತರಣೆ',
    description: 'First working day of academic year 2026-27 with grand student reception & free textbook distribution',
    description_kannada: '2026-27 ನೇ ಶೈಕ್ಷಣಿಕ ವರ್ಷದ ಮೊದಲ ದಿನ, ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸ್ವಾಗತ ಮತ್ತು ಉಚಿತ ಪಠ್ಯಪುಸ್ತಕ ವಿತರಣೆ',
    date: '2026-05-29',
    category: 'ACADEMIC_ACTIVITY',
    is_official: true,
  },
  {
    id: 'cal-2',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Bakrid (Eid-ul-Adha)',
    title_kannada: 'ಈದ್-ಉಲ್-ಅದ್ಹಾ (ಬಕ್ರೀದ್)',
    description: 'Government Holiday for Bakrid Festival',
    description_kannada: 'ಬಕ್ರೀದ್ ಹಬ್ಬದ ಪ್ರಯುಕ್ತ ಸರ್ಕಾರಿ ರಜಾದಿನ',
    date: '2026-06-17',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-3',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Formative Assessment 1 (FA1) Window',
    title_kannada: 'ರೂಪಣಾತ್ಮಕ ಮೌಲ್ಯಮಾಪನ-1 (FA-1) ಸಲ್ಲಿಕೆ',
    description: 'Submission of Home Work, Unit Tests, and Thinking Activities marks on portal',
    description_kannada: 'ಗೃಹಪಾಠ, ಕಿರುಪರೀಕ್ಷೆ ಮತ್ತು ಚಟುವಟಿಕೆಗಳ ಅಂಕಗಳ ನಮೂದು ಅವಧಿ',
    date: '2026-07-25',
    category: 'EXAM',
    is_official: true,
  },
  {
    id: 'cal-4',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Independence Day Celebrations',
    title_kannada: 'ಸ್ವಾತಂತ್ರ್ಯ ದಿನಾಚರಣೆ',
    description: 'National Holiday - Flag hoisting, parade, and student cultural programs',
    description_kannada: 'ರಾಷ್ಟ್ರೀಯ ಹಬ್ಬ - ಧ್ವಜಾರೋಹಣ, ಪಥಸಂಚಲನ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು',
    date: '2026-08-15',
    category: 'NATIONAL_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-5',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Varamahalakshmi Vrata',
    title_kannada: 'ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ',
    description: 'Government General Holiday',
    description_kannada: 'ಸರ್ಕಾರಿ ಸಾರ್ವತ್ರಿಕ ರಜಾದಿನ',
    date: '2026-08-28',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-6',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Ganesha Chaturthi',
    title_kannada: 'ಗಣೇಶ ಚತುರ್ಥಿ',
    description: 'State Festival Holiday honoring Lord Ganesha',
    description_kannada: 'ಗಣೇಶ ಚತುರ್ಥಿ ಪ್ರಯುಕ್ತ ಸಾರ್ವತ್ರಿಕ ರಜಾದಿನ',
    date: '2026-09-14',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-7',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Summative Assessment 1 (SA1) Examination',
    title_kannada: 'ಸಂಕಲನಾತ್ಮಕ ಮೌಲ್ಯಮಾಪನ-1 (SA-1) ಪರೀಕ್ಷೆಗಳು',
    description: 'Midterm SA1 written and oral assessments for all classes',
    description_kannada: 'ಎಲ್ಲಾ ತರಗತಿಗಳಿಗೆ ಮಧ್ಯಂತರ ಲಿಖಿತ ಹಾಗೂ ಮೌಖಿಕ ಪರೀಕ್ಷೆಗಳು',
    date: '2026-09-24',
    end_date: '2026-09-30',
    category: 'EXAM',
    is_official: true,
  },
  {
    id: 'cal-8',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Mahatma Gandhi Jayanti',
    title_kannada: 'ಮಹಾತ್ಮಾ ಗಾಂಧಿ ಜಯಂತಿ',
    description: 'National Holiday & Swachhata Abhiyan in school',
    description_kannada: 'ರಾಷ್ಟ್ರೀಯ ಹಬ್ಬ ಹಾಗೂ ಶಾಲೆಯಲ್ಲಿ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ',
    date: '2026-10-02',
    category: 'NATIONAL_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-9',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Mahanavami / Ayudha Pooja',
    title_kannada: 'ಮಹಾನವಮಿ / ಆಯುಧ ಪೂಜೆ',
    description: 'State Festival Holiday',
    description_kannada: 'ದಸರಾ ಹಬ್ಬದ ಸಾರ್ವತ್ರಿಕ ರಜಾದಿನ',
    date: '2026-10-19',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-10',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Vijayadashami',
    title_kannada: 'ವಿಜಯದಶಮಿ',
    description: 'Karnataka State Festival Holiday',
    description_kannada: 'ವಿಜಯದಶಮಿ ಪ್ರಯುಕ್ತ ಸಾರ್ವತ್ರಿಕ ರಜಾದಿನ',
    date: '2026-10-20',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-11',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Maharshi Valmiki Jayanti',
    title_kannada: 'ಮಹರ್ಷಿ ವಾಲ್ಮೀಕಿ ಜಯಂತಿ',
    description: 'Government Holiday honoring Sage Valmiki',
    description_kannada: 'ಮಹರ್ಷಿ ವಾಲ್ಮೀಕಿ ಜಯಂತಿ ಸರ್ಕಾರಿ ರಜಾದಿನ',
    date: '2026-10-26',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-12',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Kannada Rajyotsava',
    title_kannada: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ',
    description: 'Grand Karnataka State formation day celebration and cultural festival',
    description_kannada: 'ಕರ್ನಾಟಕ ರಾಜ್ಯೋತ್ಸವ ದಿನಾಚರಣೆ ಮತ್ತು ಭುವನೇಶ್ವರಿ ಪೂಜೆ',
    date: '2026-11-01',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-13',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Deepavali (Naraka Chaturdashi & Balipadyami)',
    title_kannada: 'ದೀಪಾವಳಿ ಹಬ್ಬ (ನರಕ ಚತುರ್ದಶಿ & ಬಲಿಪಾಡ್ಯಮಿ)',
    description: 'Festival of Lights General Holidays',
    description_kannada: 'ದೀಪಾವಳಿ ಹಬ್ಬದ ಸಾರ್ವತ್ರಿಕ ರಜಾದಿನಗಳು',
    date: '2026-11-08',
    end_date: '2026-11-10',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-14',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Kanakadasa Jayanti',
    title_kannada: 'ಕನಕದಾಸ ಜಯಂತಿ',
    description: 'State Government Holiday honoring Saint Poet Kanakadasa',
    description_kannada: 'ಭಕ್ತ ಶ್ರೇಷ್ಠ ಸಂತ ಕನಕದಾಸ ಜಯಂತಿ ಸರ್ಕಾರಿ ರಜಾದಿನ',
    date: '2026-11-26',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-15',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Pratibha Karanji School & Cluster Fest',
    title_kannada: 'ಪ್ರತಿಭಾ ಕಾರಂಜಿ ಸಾಂಸ್ಕೃತಿಕ ಉತ್ಸವ',
    description: 'Cluster and Taluk level folk dance, classical music, drama, and quiz competitions',
    description_kannada: 'ಕ್ಲಸ್ಟರ್ ಮತ್ತು ತಾಲೂಕು ಮಟ್ಟದ ವಿದ್ಯಾರ್ಥಿ ಪ್ರತಿಭಾ ಸ್ಪರ್ಧೆಗಳು',
    date: '2026-12-05',
    category: 'SCHOOL_EVENT',
    is_official: false,
  },
  {
    id: 'cal-16',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Christmas',
    title_kannada: 'ಕ್ರಿಸ್‌ಮಸ್ ಹಬ್ಬ',
    description: 'General Public Holiday',
    description_kannada: 'ಕ್ರಿಸ್‌ಮಸ್ ಹಬ್ಬದ ಸಾರ್ವತ್ರಿಕ ರಜಾದಿನ',
    date: '2026-12-25',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-17',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Makara Sankranti',
    title_kannada: 'ಮಕರ ಸಂಕ್ರಾಂತಿ',
    description: 'Harvest Festival Holiday',
    description_kannada: 'ಸುಗ್ಗಿ ಹಬ್ಬ ಮಕರ ಸಂಕ್ರಾಂತಿ ಸಾರ್ವತ್ರಿಕ ರಜೆ',
    date: '2027-01-14',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-18',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Republic Day Celebrations',
    title_kannada: 'ಗಣರಾಜ್ಯೋತ್ಸವ ದಿನಾಚರಣೆ',
    description: 'National Flag hoisting, March Past, and Constitution awareness programs',
    description_kannada: 'ರಾಷ್ಟ್ರಧ್ವಜಾರೋಹಣ, ಪಥಸಂಚಲನ ಹಾಗೂ ಸಂವಿಧಾನ ದಿನ ಸಂದೇಶ',
    date: '2027-01-26',
    category: 'NATIONAL_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-19',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Maha Shivaratri',
    title_kannada: 'ಮಹಾ ಶಿವರಾತ್ರಿ',
    description: 'State Festival Holiday',
    description_kannada: 'ಮಹಾ ಶಿವರಾತ್ರಿ ಪ್ರಯುಕ್ತ ಸಾರ್ವತ್ರಿಕ ರಜೆ',
    date: '2027-03-06',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-20',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Summative Assessment 2 (SA2) Annual Examination',
    title_kannada: 'ಸಂಕಲನಾತ್ಮಕ ಮೌಲ್ಯಮಾಪನ-2 (SA-2) ವಾರ್ಷಿಕ ಪರೀಕ್ಷೆಗಳು',
    description: 'Final Karnataka CCE annual written examination for Classes 1 to 9',
    description_kannada: '1 ರಿಂದ 9ನೇ ತರಗತಿಗಳ ಕರ್ನಾಟಕ ಅಧಿಕೃತ CCE ವಾರ್ಷಿಕ ಲಿಖಿತ ಪರೀಕ್ಷೆಗಳು',
    date: '2027-03-22',
    end_date: '2027-03-30',
    category: 'EXAM',
    is_official: true,
  },
  {
    id: 'cal-21',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Chandramana Ugadi',
    title_kannada: 'ಚಾಂದ್ರಮಾನ ಯುಗಾದಿ',
    description: 'Karnataka New Year Holiday',
    description_kannada: 'ಹೊಸ ವರ್ಷದ ಯುಗಾದಿ ಹಬ್ಬದ ಸಾರ್ವತ್ರಿಕ ರಜೆ',
    date: '2027-04-07',
    category: 'GOVT_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-22',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Dr. B.R. Ambedkar Jayanti',
    title_kannada: 'ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಜಯಂತಿ',
    description: 'National and State Official Holiday honoring Baba Saheb Ambedkar',
    description_kannada: 'ಸಂವಿಧಾನ ಶಿಲ್ಪಿ ಬಾಬಾಸಾಹೇಬ್ ಅಂಬೇಡ್ಕರ್ ಜಯಂತಿ ಸಾರ್ವತ್ರಿಕ ರಜೆ',
    date: '2027-04-14',
    category: 'NATIONAL_HOLIDAY',
    is_official: true,
  },
  {
    id: 'cal-23',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Academic Year Conclusion & CCE Results Declaration',
    title_kannada: 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ ಮುಕ್ತಾಯ ಮತ್ತು ವಾರ್ಷಿಕ ಫಲಿತಾಂಶ ಪ್ರಕಟಣೆ',
    description: 'Official final day of academic year 2026-27 and distribution of CCE annual progress cards',
    description_kannada: '2026-27 ನೇ ಸಾಲಿನ ಅಧಿಕೃತ ಕೊನೆಯ ಕೆಲಸದ ದಿನ ಮತ್ತು ಪ್ರಗತಿಪತ್ರ ವಿತರಣೆ',
    date: '2027-04-30',
    category: 'ACADEMIC_ACTIVITY',
    is_official: true,
  },
];

export const INITIAL_ACHIEVEMENTS: SchoolAchievement[] = [
  // 2026-27 (Latest)
  {
    id: 'ach-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'State Level Kho-Kho Championship Winners',
    category: 'Sports',
    student_name: 'Prajwal Kumar & High School Team',
    class_number: 10,
    description: 'Represented Mysuru district and clinched 1st place in Karnataka State High School Sports Meet held at Shivamogga.',
    date: '2026-09-18',
  },
  {
    id: 'ach-2',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'National INSPIRE Awards - MANAK Recognition',
    category: 'INSPIRE Awards',
    student_name: 'Bhumika S Gowda',
    class_number: 10,
    description: 'Selected for National Science Exhibition for innovative solar-powered smart drip irrigation prototype for rural farmers.',
    date: '2026-08-10',
  },
  {
    id: 'ach-3',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Pratibha Karanji District 1st Prize in Bhavageethe',
    category: 'Pratibha Karanji',
    student_name: 'Ananya S',
    class_number: 8,
    description: 'Rendered Bendre and Kuvempu poetry melodiously, securing 1st prize across Mysuru district schools.',
    date: '2026-10-04',
  },
  // 2025-26
  {
    id: 'ach-4',
    school_id: 'school-1',
    academic_year: '2025-26',
    title: 'District High School Quiz Championship - Gold Medal',
    category: 'Competitive Examinations',
    student_name: 'Darshan Kumar & Rakshitha M',
    class_number: 9,
    description: 'Secured first place in the Department of School Education annual quiz on Karnataka history and modern science.',
    date: '2025-11-14',
  },
  {
    id: 'ach-5',
    school_id: 'school-1',
    academic_year: '2025-26',
    title: 'South Zone High Jump Silver Medalist',
    category: 'Sports',
    student_name: 'Kiran Gowda',
    class_number: 10,
    description: 'Cleared 1.72m at the Karnataka State Inter-School Athletics Championship.',
    date: '2025-12-05',
  },
  // 2024-25
  {
    id: 'ach-6',
    school_id: 'school-1',
    academic_year: '2024-25',
    title: 'State Kannada Sahitya Sammelana Recitation Honor',
    category: 'Pratibha Karanji',
    student_name: 'Spoorthi N',
    class_number: 8,
    description: 'Special state award for classical Vachana Sahitya recitation in Kannada literature category.',
    date: '2024-11-01',
  },
];

export const INITIAL_CONSTRUCTION_WORKS: ConstructionWork[] = [
  // 2026-27
  {
    id: 'cw-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'High-Tech Smart Science Laboratory Modernization',
    description: 'Installation of modular lab benches, digital microscope displays, chemical fume hoods, and physics demonstration models funded by MLA Local Area Development Fund.',
    date: '2026-07-15',
    estimated_cost: 450000,
    completion_status: 'COMPLETED',
  },
  {
    id: 'cw-2',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Solar Rooftop Power System Installation (10 kW)',
    description: 'Installation of 10kW grid-interactive solar photovoltaic panels with battery backup to ensure uninterrupted power for computer lab and smart boards.',
    date: '2026-09-01',
    estimated_cost: 620000,
    completion_status: 'IN_PROGRESS',
  },
  {
    id: 'cw-3',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Midday Meal Dining Hall Expansion & RO Water Plant',
    description: 'Construction of hygienic covered dining area accommodating 300 students with 500 LPH RO water purification unit.',
    date: '2026-10-25',
    estimated_cost: 380000,
    completion_status: 'PLANNED',
  },
  // 2025-26
  {
    id: 'cw-4',
    school_id: 'school-1',
    academic_year: '2025-26',
    title: 'Smart Classroom Digital Board Retrofitting (Rooms 101-104)',
    description: 'Installed 4 interactive touch displays with integrated audio and Karnataka textbook syllabus digital content.',
    date: '2025-08-10',
    estimated_cost: 510000,
    completion_status: 'COMPLETED',
  },
  {
    id: 'cw-5',
    school_id: 'school-1',
    academic_year: '2025-26',
    title: 'Campus Perimeter Security Wall & Gate Fabrication',
    description: 'Erected 180m concrete boundary fencing with decorative metal gates to safeguard campus premises.',
    date: '2025-11-20',
    estimated_cost: 290000,
    completion_status: 'COMPLETED',
  },
  // 2024-25
  {
    id: 'cw-6',
    school_id: 'school-1',
    academic_year: '2024-25',
    title: 'Rainwater Harvesting Dual Recharge Wells',
    description: 'Constructed roof runoff catchment system recharging underground aquifer with 80,000L annual capacity.',
    date: '2024-09-15',
    estimated_cost: 175000,
    completion_status: 'COMPLETED',
  },
];

export const INITIAL_SDMC_MEETINGS: SDMCMeeting[] = [
  // 2026-27
  {
    id: 'sdmc-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: '1st Quarter SDMC General Body Meeting',
    date: '2026-06-20',
    agenda: 'Review of Class 10 SSLC results, enrollment campaign, Midday meal inspection committee formation.',
    summary: 'SDMC president and 18 members present. Congratulated faculty for 94% pass rate in SSLC. Approved budget for school uniform accessories.',
    decisions_taken: 'Unanimously resolved to conduct daily remedial coaching classes for slow learners in Mathematics and English.',
  },
  {
    id: 'sdmc-2',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Special SDMC Meeting on CCE Digital Infrastructure',
    date: '2026-09-12',
    agenda: 'Approval of computer lab internet upgrade, solar rooftop grant endorsement, parent-teacher interaction scheduling.',
    summary: 'Headmaster demonstrated Karnataka CCE marks card generation module. Parents appreciated digital report cards.',
    decisions_taken: 'Authorized expenditure of ₹25,000 for high-speed fiber broadband connection for uninterrupted offline CCE sync.',
  },
  // 2025-26
  {
    id: 'sdmc-3',
    school_id: 'school-1',
    academic_year: '2025-26',
    title: 'Annual Infrastructure and Budget Review Meeting',
    date: '2025-10-18',
    agenda: 'Sanctioning campus boundary wall construction and school playground leveling.',
    summary: 'Committee verified government matching grants and approved quotation from registered civil contractor.',
    decisions_taken: 'Allocated funds for sports equipment purchase before district sports meet.',
  },
  // 2024-25
  {
    id: 'sdmc-4',
    school_id: 'school-1',
    academic_year: '2024-25',
    title: 'SDMC Constitution & Community Outreach Conclave',
    date: '2024-07-22',
    agenda: 'Election of parent representatives, verification of free textbook distribution, CWSN ramp construction.',
    summary: 'Complete quorum with 22 members present. Formed Midday Meal Quality Verification Sub-Committee.',
    decisions_taken: 'Mandated bi-weekly random tasting of hot meals and monthly student attendance audits.',
  },
];

export const INITIAL_GALLERY: SchoolGalleryItem[] = [
  // 2026-27
  {
    id: 'gal-1',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Grand Shala Prarambhotsava & Book Distribution',
    description: 'Warm floral welcome to incoming Class 8 students by SDMC committee, free textbook kits and bag distribution ceremony.',
    date: '2026-05-29',
    photos: [
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'gal-2',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Independence Day Patriotic Celebrations',
    description: 'Color party march past, flag hoisting by SDMC President, patriotic singing and cultural dances by high school students.',
    date: '2026-08-15',
    photos: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'gal-3',
    school_id: 'school-1',
    academic_year: '2026-27',
    title: 'Annual Science & Robotic Innovation Exhibition',
    description: 'Working models on rainwater harvesting, hydraulic cranes, bio-fertilizers, and smart traffic lights demonstrated by students.',
    date: '2026-10-14',
    photos: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    ],
  },
  // 2025-26
  {
    id: 'gal-4',
    school_id: 'school-1',
    academic_year: '2025-26',
    title: 'Karnataka Rajyotsava Cultural Gala 2025',
    description: 'Students presenting traditional Dollu Kunitha and Yakshagana folk dance performances.',
    date: '2025-11-01',
    photos: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    ],
  },
  // 2024-25
  {
    id: 'gal-5',
    school_id: 'school-1',
    academic_year: '2024-25',
    title: 'Eco-Club Vanamahotsava Tree Planting Drive',
    description: 'Planted 150 native shade and fruit-bearing saplings along the campus playground perimeter.',
    date: '2024-07-07',
    photos: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

export const INITIAL_FORMER_STUDENTS: FormerStudent[] = [
  {
    id: 'former-1',
    school_id: 'school-1',
    student_id: 'std_archived_1',
    original_admission_no: 'ADM-2022-045',
    student_name: 'Pooja Shankar',
    tc_id: 'tc-2025-089',
    tc_no: 'TC/2025/089',
    transfer_date: '2025-04-12',
    class_at_transfer: 10,
    academic_year: '2024-25',
    reason: 'Completed Class 10 (SSLC Examination)',
    correction_history: [
      {
        field: 'student_name',
        old_value: 'Poojashankar',
        new_value: 'Pooja Shankar',
        reason: 'Spelling correction as per Aadhaar & Birth Certificate',
        approver: 'Headmaster (Ramesh Gowda)',
        approved_at: '2025-05-10T10:30:00Z',
      },
    ],
  },
  {
    id: 'former-2',
    school_id: 'school-1',
    student_id: 'std_archived_2',
    original_admission_no: 'ADM-2023-112',
    student_name: 'Vinay Kumar N',
    tc_id: 'tc-2025-104',
    tc_no: 'TC/2025/104',
    transfer_date: '2025-06-18',
    class_at_transfer: 9,
    academic_year: '2025-26',
    reason: 'Parent transfer to Bengaluru North',
    correction_history: [],
  },
  {
    id: 'former-3',
    school_id: 'school-1',
    student_id: 'std_archived_3',
    original_admission_no: 'ADM-2024-078',
    student_name: 'Megha R',
    tc_id: 'tc-2025-112',
    tc_no: 'TC/2025/112',
    transfer_date: '2025-07-04',
    class_at_transfer: 8,
    academic_year: '2025-26',
    reason: 'Admission secured at Morarji Desai Residential School',
    correction_history: [],
  },
];
