import {
  AcademicCalendarEvent,
  AssessmentRecord,
  CoCurricularGradeRecord,
  ConstructionWork,
  FacultyAssignment,
  School,
  SchoolAchievement,
  SchoolGalleryItem,
  SDMCMeeting,
  Student,
  User,
} from '../types';

export const DEMO_SCHOOL_ID = 'school-demo-ranebennur';
export const DEMO_HM_ID = 'user-demo-hm-ranebennur';

export const DEMO_PENDING_SCHOOL_ID = 'school-demo-pending-bellary';
export const DEMO_PENDING_HM_ID = 'user-demo-hm-pending-bellary';
export const DEMO_FACULTY_IDS = Array.from({ length: 5 }, (_, index) =>
  `user-demo-faculty-${String(index + 1).padStart(2, '0')}`
);

const createdAt = '2026-07-12T00:00:00.000Z';
const academicYears = ['2024-25', '2025-26', '2026-27'];
const subjectNames = [
  'First Language (Kannada)',
  'Second Language (English)',
  'Third Language (Hindi)',
  'Mathematics',
  'Science',
  'Social Science',
];
const assessmentTypes = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'] as const;

export const DEMO_SCHOOLS: School[] = [
  {
    id: DEMO_SCHOOL_ID,
    udise: '99999999999',
    name: 'Government School, Ranebennur (DEMO)',
    name_kannada: 'ಸರ್ಕಾರಿ ಶಾಲೆ, ರಾಣೆಬೆನ್ನೂರು (ಡೆಮೊ)',
    hm_name: 'Demo Headmaster',
    hm_name_kannada: 'ಡೆಮೊ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
    hm_phone: '0000000001',
    email: 'school@ranebennur-demo.invalid',
    taluk: 'Ranebennur',
    taluk_kannada: 'ರಾಣೆಬೆನ್ನೂರು',
    district: 'Haveri',
    district_kannada: 'ಹಾವೇರಿ',
    state: 'Karnataka',
    description: 'Demo school for testing bilingual records, CCE marks, annual reports, and school information.',
    description_kannada: 'ದ್ವಿಭಾಷಾ ದಾಖಲೆಗಳು, ಸಿಸಿಇ ಅಂಕಗಳು, ವಾರ್ಷಿಕ ವರದಿಗಳು ಮತ್ತು ಶಾಲಾ ಮಾಹಿತಿಯನ್ನು ಪರೀಕ್ಷಿಸಲು ಡೆಮೊ ಶಾಲೆ.',
    status: 'ACTIVE',
    current_academic_year: '2026-27',
    working_days_by_year: {},
    registration_date: createdAt,
    expiry_date: '2027-04-30',
    created_at: createdAt,
    updated_at: createdAt,
  },
  {
    id: DEMO_PENDING_SCHOOL_ID,
    udise: '29120304501',
    name: 'Government High School, Siruguppa (Pending Approval)',
    name_kannada: 'ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಸಿರುಗುಪ್ಪ (ಅನುಮೋದನೆಗೆ ಕಾದಿರುವ ಶಾಲೆ)',
    hm_name: 'Sri Basavaraj B.',
    hm_name_kannada: 'ಶ್ರೀ ಬಸವರಾಜ್ ಬಿ.',
    hm_phone: '9845123456',
    email: 'ghs.siruguppa@karnataka.gov.in',
    taluk: 'Siruguppa',
    taluk_kannada: 'ಸಿರುಗುಪ್ಪ',
    district: 'Ballari',
    district_kannada: 'ಬಳ್ಳಾರಿ',
    state: 'Karnataka',
    description: 'Newly registered Government High School awaiting Platform Admin verification and CCE portal clearance.',
    description_kannada: 'ವೇದಿಕೆ ನಿರ್ವಾಹಕರ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಿಸಿಇ ಪೋರ್ಟಲ್ ಅನುಮೋದನೆಗೆ ಕಾಯುತ್ತಿರುವ ಹೊಸದಾಗಿ ನೋಂದಾಯಿತ ಪ್ರೌಢಶಾಲೆ.',
    status: 'PENDING_APPROVAL',
    current_academic_year: '2026-27',
    working_days_by_year: {},
    registration_date: createdAt,
    expiry_date: '2027-04-30',
    created_at: createdAt,
    updated_at: createdAt,
  },
];

export const DEMO_USERS: User[] = [
  {
    id: DEMO_PENDING_HM_ID,
    school_id: DEMO_PENDING_SCHOOL_ID,
    role: 'SCHOOL_ADMIN',
    name: 'Sri Basavaraj B. (Pending HM)',
    name_kannada: 'ಶ್ರೀ ಬಸವರಾಜ್ ಬಿ. (ಮುಖ್ಯ ಶಿಕ್ಷಕರು - ಕಾದಿರುವ)',
    phone: '9845123456',
    email: 'basavaraj.hm@pending-demo.invalid',
    designation: 'Headmaster',
    designation_kannada: 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
    status: 'PENDING',
    created_at: createdAt,
    updated_at: createdAt,
  },
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
    id: DEMO_HM_ID,
    school_id: DEMO_SCHOOL_ID,
    role: 'SCHOOL_ADMIN',
    name: 'Demo Headmaster',
    name_kannada: 'ಡೆಮೊ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
    phone: '0000000001',
    email: 'headmaster@ranebennur-demo.invalid',
    designation: 'Headmaster',
    designation_kannada: 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು',
    status: 'ACTIVE',
    created_at: createdAt,
    updated_at: createdAt,
  },
  ...DEMO_FACULTY_IDS.map((id, index): User => ({
    id,
    school_id: DEMO_SCHOOL_ID,
    role: 'FACULTY',
    name: `Demo Teacher ${String(index + 1).padStart(2, '0')}`,
    name_kannada: `ಡೆಮೊ ಶಿಕ್ಷಕರು ${String(index + 1).padStart(2, '0')}`,
    phone: `000000000${index + 2}`,
    email: `teacher${String(index + 1).padStart(2, '0')}@ranebennur-demo.invalid`,
    designation: 'Teacher',
    designation_kannada: 'ಶಿಕ್ಷಕರು',
    status: 'ACTIVE',
    created_at: createdAt,
    updated_at: createdAt,
  })),
];

const demoStudentName = (number: number) => `Demo Student ${String(number).padStart(2, '0')}`;
const demoStudentNameKannada = (number: number) => `ಡೆಮೊ ವಿದ್ಯಾರ್ಥಿ ${String(number).padStart(2, '0')}`;
const demoParentName = (number: number) => `Demo Parent ${String(number).padStart(2, '0')}`;
const demoParentNameKannada = (number: number) => `ಡೆಮೊ ಪೋಷಕರು ${String(number).padStart(2, '0')}`;
const yearCode = (year: string) => year.slice(0, 4);
const classFor = (studentNumber: number, yearIndex: number) =>
  (studentNumber <= 12 ? 7 : 8) + yearIndex;
const studentIdFor = (year: string, studentNumber: number) =>
  `demo-student-${yearCode(year)}-${String(studentNumber).padStart(2, '0')}`;

export const DEMO_STUDENTS: Student[] = academicYears.flatMap((academicYear, yearIndex) =>
  Array.from({ length: 25 }, (_, offset): Student => {
    const number = offset + 1;
    return {
      id: studentIdFor(academicYear, number),
      school_id: DEMO_SCHOOL_ID,
      academic_year: academicYear,
      admission_no: `DEMO-${yearCode(academicYear)}-${String(number).padStart(3, '0')}`,
      sats_no: `DEMO-SATS-${yearCode(academicYear)}-${String(number).padStart(3, '0')}`,
      pen_no: `DEMO-PEN-${yearCode(academicYear)}-${String(number).padStart(3, '0')}`,
      aadhaar_no: '',
      name: demoStudentName(number),
      name_kannada: demoStudentNameKannada(number),
      gender: number % 2 === 0 ? 'GIRL' : 'BOY',
      dob: `2010-${String(((number - 1) % 12) + 1).padStart(2, '0')}-15`,
      religion: 'Not specified (demo)',
      category: 'GM',
      caste: 'Demo',
      caste_kannada: 'ಡೆಮೊ',
      father_name: demoParentName(number),
      father_name_kannada: demoParentNameKannada(number),
      mother_name: `Demo Parent ${String(number).padStart(2, '0')} B`,
      mother_name_kannada: `ಡೆಮೊ ಪೋಷಕರು ${String(number).padStart(2, '0')} ಬಿ`,
      cwsn: false,
      mobile: '',
      class_number: classFor(number, yearIndex),
      section: 'A',
      place_of_birth: 'Ranebennur (demo)',
      place_of_birth_kannada: 'ರಾಣೆಬೆನ್ನೂರು (ಡೆಮೊ)',
      taluk: 'Ranebennur',
      taluk_kannada: 'ರಾಣೆಬೆನ್ನೂರು',
      district: 'Haveri',
      district_kannada: 'ಹಾವೇರಿ',
      state: 'Karnataka',
      nationality: 'Indian',
      medium_of_instruction: 'Kannada and English',
      admission_date: `${yearCode(academicYear)}-06-10`,
      status: 'ACTIVE',
      created_at: createdAt,
      updated_at: createdAt,
    };
  })
);

function getAssessmentMaximum(classNumber: number, subject: string, type: string): number {
  if (classNumber >= 9) {
    if (type.startsWith('FA')) return 50;
    return subject.includes('First Language') ? 100 : 80;
  }
  return type.startsWith('FA') ? 10 : 30;
}

function getDemoMarks(classNumber: number, studentNumber: number, subjectIndex: number, type: string): number {
  const offset = (studentNumber + subjectIndex * 2 + assessmentTypes.indexOf(type as typeof assessmentTypes[number])) % 5;
  if (classNumber >= 9 && type.startsWith('FA')) return 35 + offset * 3;
  if (classNumber >= 9 && subjectIndex === 0) return 76 + offset * 4;
  if (classNumber >= 9) return 60 + offset * 4;
  if (type.startsWith('FA')) return 6 + (offset % 4);
  return 20 + offset * 2;
}

function gradeFor(marks: number, maximum: number, classNumber: number): AssessmentRecord['grade'] {
  const percentage = (marks / maximum) * 100;
  if (classNumber === 10) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 35) return 'C';
    return 'NC';
  }
  if (percentage >= 90) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 50) return 'B+';
  if (percentage >= 30) return 'B';
  return 'C';
}

export const DEMO_ASSESSMENTS: AssessmentRecord[] = DEMO_STUDENTS.flatMap((student, studentIndex) =>
  subjectNames.flatMap((subject, subjectIndex) =>
    assessmentTypes.map((assessmentType): AssessmentRecord => {
      const studentNumber = (studentIndex % 25) + 1;
      const total_marks = getDemoMarks(student.class_number, studentNumber, subjectIndex, assessmentType);
      const max_marks = getAssessmentMaximum(student.class_number, subject, assessmentType);
      return {
        id: `demo-mark-${student.academic_year.slice(0, 4)}-${studentNumber.toString().padStart(2, '0')}-${subjectIndex + 1}-${assessmentType}`,
        school_id: DEMO_SCHOOL_ID,
        academic_year: student.academic_year,
        student_id: student.id,
        class_number: student.class_number,
        section: student.section,
        subject_name: subject,
        assessment_type: assessmentType,
        total_marks,
        max_marks,
        grade: gradeFor(total_marks, max_marks, student.class_number),
        attendance_count: 0,
        updated_by: 'Demo Headmaster',
        updated_at: createdAt,
      };
    })
  )
);

export const DEMO_CO_CURRICULAR: CoCurricularGradeRecord[] = DEMO_STUDENTS.map((student, index) => {
  const grade = (['A+', 'A', 'B+'] as const)[index % 3];
  return {
    id: `demo-cocurricular-${student.academic_year.slice(0, 4)}-${String((index % 25) + 1).padStart(2, '0')}`,
    school_id: DEMO_SCHOOL_ID,
    student_id: student.id,
    academic_year: student.academic_year,
    class_number: student.class_number,
    daihika_arogya: grade,
    moulya: grade,
    kaaryanubhava: grade,
    kala: grade,
    updated_by: 'Demo Headmaster',
    updated_at: createdAt,
  };
});

export const DEMO_FACULTY_ASSIGNMENTS: FacultyAssignment[] = academicYears.flatMap((academicYear, yearIndex) =>
  [7 + yearIndex, 8 + yearIndex].flatMap((classNumber) =>
    subjectNames.map((subject, subjectIndex): FacultyAssignment => ({
      id: `demo-assignment-${academicYear.slice(0, 4)}-${classNumber}-${subjectIndex + 1}`,
      faculty_id: DEMO_FACULTY_IDS[Math.min(subjectIndex, DEMO_FACULTY_IDS.length - 1)],
      school_id: DEMO_SCHOOL_ID,
      academic_year: academicYear,
      class_number: classNumber,
      section: 'A',
      subject_name: subject,
      is_class_teacher: subjectIndex === 0,
    }))
  )
);

export const DEMO_CALENDAR_EVENTS: AcademicCalendarEvent[] = academicYears.map((year) => ({
  id: `demo-calendar-${year.slice(0, 4)}`,
  school_id: DEMO_SCHOOL_ID,
  academic_year: year,
  title: 'Annual School Exhibition',
  title_kannada: 'ವಾರ್ಷಿಕ ಶಾಲಾ ಪ್ರದರ್ಶನ',
  description: 'Demo event for bilingual school calendar testing.',
  description_kannada: 'ದ್ವಿಭಾಷಾ ಶಾಲಾ ಕ್ಯಾಲೆಂಡರ್ ಪರೀಕ್ಷೆಗಾಗಿ ಡೆಮೊ ಕಾರ್ಯಕ್ರಮ.',
  date: `${year.slice(0, 4)}-12-10`,
  category: 'SCHOOL_EVENT',
  is_official: false,
  created_by: DEMO_HM_ID,
}));

export const DEMO_ACHIEVEMENTS: SchoolAchievement[] = academicYears.map((year, index) => ({
  id: `demo-achievement-${year.slice(0, 4)}`,
  school_id: DEMO_SCHOOL_ID,
  academic_year: year,
  title: 'Demo Student Science Exhibition Participation',
  title_kannada: 'ಡೆಮೊ ವಿದ್ಯಾರ್ಥಿಗಳ ವಿಜ್ಞಾನ ಪ್ರದರ್ಶನದ ಭಾಗವಹಿಸುವಿಕೆ',
  category: 'Other',
  student_name: demoStudentName(index + 1),
  student_name_kannada: demoStudentNameKannada(index + 1),
  class_number: 9,
  description: 'Sample bilingual achievement record for demonstration only.',
  description_kannada: 'ಪ್ರಾತ್ಯಕ್ಷಿಕೆಗಾಗಿ ಮಾತ್ರ ಮಾದರಿ ದ್ವಿಭಾಷಾ ಸಾಧನೆ ದಾಖಲೆ.',
  date: `${Number(year.slice(0, 4)) + 1}-01-20`,
}));

export const DEMO_CONSTRUCTION_WORKS: ConstructionWork[] = academicYears.map((year) => ({
  id: `demo-construction-${year.slice(0, 4)}`,
  school_id: DEMO_SCHOOL_ID,
  academic_year: year,
  title: 'Demo Classroom Maintenance',
  title_kannada: 'ಡೆಮೊ ತರಗತಿ ಕೊಠಡಿ ನಿರ್ವಹಣೆ',
  description: 'Sample maintenance entry. No real construction project or expenditure is represented.',
  description_kannada: 'ಮಾದರಿ ನಿರ್ವಹಣೆ ದಾಖಲೆ. ನೈಜ ನಿರ್ಮಾಣ ಕಾಮಗಾರಿ ಅಥವಾ ವೆಚ್ಚವನ್ನು ಸೂಚಿಸುವುದಿಲ್ಲ.',
  date: `${year.slice(0, 4)}-11-15`,
  estimated_cost: 0,
  completion_status: 'COMPLETED',
}));

export const DEMO_SDMC_MEETINGS: SDMCMeeting[] = academicYears.map((year) => ({
  id: `demo-sdmc-${year.slice(0, 4)}`,
  school_id: DEMO_SCHOOL_ID,
  academic_year: year,
  title: 'Demo SDMC Annual Review',
  title_kannada: 'ಡೆಮೊ ಎಸ್‌ಡಿಎಂಸಿ ವಾರ್ಷಿಕ ಪರಿಶೀಲನಾ ಸಭೆ',
  date: `${year.slice(0, 4)}-09-15`,
  agenda: 'Review academic progress and school facilities (demo record).',
  agenda_kannada: 'ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ ಮತ್ತು ಶಾಲಾ ಸೌಲಭ್ಯಗಳ ಪರಿಶೀಲನೆ (ಡೆಮೊ ದಾಖಲೆ).',
  summary: 'Sample bilingual meeting record for testing only.',
  summary_kannada: 'ಪರೀಕ್ಷೆಗಾಗಿ ಮಾತ್ರ ಮಾದರಿ ದ್ವಿಭಾಷಾ ಸಭಾ ದಾಖಲೆ.',
  decisions_taken: 'No official decision; this is a demonstration record.',
  decisions_taken_kannada: 'ಯಾವುದೇ ಅಧಿಕೃತ ನಿರ್ಧಾರವಿಲ್ಲ; ಇದು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ದಾಖಲೆ.',
}));

export const DEMO_GALLERY: SchoolGalleryItem[] = academicYears.map((year) => ({
  id: `demo-gallery-${year.slice(0, 4)}`,
  school_id: DEMO_SCHOOL_ID,
  academic_year: year,
  title: 'Demo School Activity',
  title_kannada: 'ಡೆಮೊ ಶಾಲಾ ಚಟುವಟಿಕೆ',
  description: 'Placeholder entry for gallery layout testing; no photograph is attached.',
  description_kannada: 'ಗ್ಯಾಲರಿ ವಿನ್ಯಾಸ ಪರೀಕ್ಷೆಗಾಗಿ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್ ದಾಖಲೆ; ಯಾವುದೇ ಛಾಯಾಚಿತ್ರವನ್ನು ಸೇರಿಸಿಲ್ಲ.',
  date: `${year.slice(0, 4)}-10-10`,
  photos: [],
}));
