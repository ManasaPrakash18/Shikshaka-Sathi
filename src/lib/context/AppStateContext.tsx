'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  StudentAuditLog,
  AssessmentRecord,
  CoCurricularGradeRecord,
  AcademicCalendarEvent,
  SchoolAchievement,
  ConstructionWork,
  SDMCMeeting,
  SchoolGalleryItem,
  TransferCertificate,
  StudyCertificate,
  FormerStudent,
  School,
  User,
  StudentPromotionRecord,
  SyncState,
} from '../types';
import { erpLocalDB, ERPStorageState, getInitialState } from '../db/indexedDB';
import { syncEngine, SyncEngineStatus } from '../db/syncEngine';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabaseClient';


export function calculateAcademicYearExpiry(academicYear?: string, referenceDate: Date = new Date()): string {
  if (academicYear && /^\d{4}-\d{2}$/.test(academicYear)) {
    const startYear = parseInt(academicYear.slice(0, 4), 10);
    // E.g. "2026-27" -> expires on April 30, 2027
    const endYear = startYear + 1;
    return `${endYear}-04-30`;
  }
  const currentMonth = referenceDate.getMonth(); // 0-indexed (April is 3)
  const currentYear = referenceDate.getFullYear();
  // If approved between June (5) and Dec (11), expires April 30 of next calendar year.
  // If approved between Jan (0) and April (3), expires April 30 of current calendar year.
  // If approved in May (4), it belongs to upcoming year starting June, so next year April 30.
  const expiryYear = currentMonth <= 3 ? currentYear : currentYear + 1;
  return `${expiryYear}-04-30`;
}

interface AppStateContextType {
  state: ERPStorageState;
  syncStatus: SyncEngineStatus;
  isLoading: boolean;
  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<Student>;
  updateStudent: (
    id: string,
    updatedData: Partial<Student>,
    reason: string,
    updatedBy: string
  ) => Promise<void>;
  importStudents: (studentsList: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]) => Promise<number>;
  promoteStudents: (
    fromYear: string,
    toYear: string,
    promotions: { studentId: string; fromClass: number; toClass: number; status: 'PROMOTED' | 'RETAINED' | 'GRADUATED' }[],
    promotedBy: string
  ) => Promise<void>;
  // Marks Actions
  saveAssessmentMark: (record: Omit<AssessmentRecord, 'id' | 'updated_at'>) => Promise<AssessmentRecord>;
  saveCoCurricularGrade: (record: Omit<CoCurricularGradeRecord, 'id' | 'updated_at'>) => Promise<void>;
  // Calendar Actions
  addCalendarEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  importCalendarEvents: (events: Omit<AcademicCalendarEvent, 'id'>[], clearExisting?: boolean) => Promise<number>;
  // About School Actions
  addAchievement: (achievement: Omit<SchoolAchievement, 'id'>) => Promise<void>;
  addConstructionWork: (work: Omit<ConstructionWork, 'id'>) => Promise<void>;
  addSDMCMeeting: (meeting: Omit<SDMCMeeting, 'id'>) => Promise<void>;
  addGalleryItem: (item: Omit<SchoolGalleryItem, 'id'>) => Promise<void>;
  // Records & Certificates
  finalizeTransferCertificate: (tc: Omit<TransferCertificate, 'id' | 'created_at' | 'updated_at'>) => Promise<TransferCertificate>;
  updateFormerStudent: (
    id: string,
    updatedData: Partial<FormerStudent>,
    reason: string,
    updatedBy: string
  ) => Promise<void>;
  issueStudyCertificate: (cert: Omit<StudyCertificate, 'id' | 'created_at'>) => Promise<StudyCertificate>;
  // Platform Admin School Management
  registerSchool: (school: Omit<School, 'id' | 'created_at' | 'updated_at'>) => Promise<School>;
  approveSchool: (schoolId: string, performedBy: string) => Promise<void>;
  revokeSchoolAccess: (schoolId: string, reason?: string, performedBy?: string) => Promise<void>;
  reactivateSchoolAccess: (schoolId: string, performedBy: string) => Promise<void>;
  // Faculty Management
  addFacultyUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<User>;
  toggleFacultyStatus: (userId: string, newStatus: 'ACTIVE' | 'REVOKED') => Promise<void>;
  // Sync Controls
  triggerManualSync: () => Promise<void>;
  pullCloudData: () => Promise<{ success: boolean; message: string; counts: Record<string, number> }>;
  toggleOfflineSimulator: () => boolean;
  downloadBackupJSON: () => void;
  restoreBackupJSON: (jsonData: string) => Promise<boolean>;
  refreshState: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ERPStorageState>(() => getInitialState());
  const [syncStatus, setSyncStatus] = useState<SyncEngineStatus>(syncEngine.getStatus());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from IndexedDB and enforce academic year expiry
  useEffect(() => {
    erpLocalDB.loadState().then(async (loaded) => {
      const todayStr = new Date().toISOString().split('T')[0];
      let hasExpired = false;
      const updatedTime = new Date().toISOString();

      const updatedSchools = loaded.schools.map((s) => {
        // Enforce automatic revocation if expiry_date is hit/passed
        if (s.status === 'ACTIVE' && s.expiry_date && todayStr > s.expiry_date) {
          hasExpired = true;
          return { ...s, status: 'REVOKED' as const, updated_at: updatedTime };
        }
        return s;
      });

      if (hasExpired) {
        const nextState = { ...loaded, schools: updatedSchools };
        await erpLocalDB.persistState(nextState);
        setState(nextState);
      } else {
        setState(loaded);
      }
      setIsLoading(false);
    });

    const unsubscribeSync = syncEngine.subscribe((status) => {
      setSyncStatus(status);
    });

    const unsubscribeDB = erpLocalDB.subscribe((freshState) => {
      setState(freshState);
    });

    return () => {
      unsubscribeSync();
      unsubscribeDB();
    };
  }, []);

  const persistAndNotify = useCallback(async (updater: (prev: ERPStorageState) => ERPStorageState) => {
    setState((prev) => {
      const next = updater(prev);
      erpLocalDB.persistState(next);
      // Automatically sync changes to Supabase Cloud in background when connected to internet
      syncEngine.scheduleAutoSync();
      return next;
    });
  }, []);

  // 1. ADD STUDENT
  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> => {
    const newStudent: Student = {
      ...studentData,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await persistAndNotify((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
    }));

    await syncEngine.enqueueOperation({
      idempotency_key: `create_student_${newStudent.id}`,
      school_id: newStudent.school_id,
      user_id: 'current_user',
      entity_type: 'students',
      record_id: newStudent.id,
      operation_type: 'CREATE',
      data: newStudent,
    });

    return newStudent;
  };

  // 2. UPDATE STUDENT (WITH MANDATORY AUDIT REASON)
  const updateStudent = async (
    id: string,
    updatedData: Partial<Student>,
    reason: string,
    updatedBy: string
  ): Promise<void> => {
    const existing = state.students.find((s) => s.id === id);
    if (!existing) return;

    const auditLogs: StudentAuditLog[] = [];
    Object.keys(updatedData).forEach((key) => {
      const field = key as keyof Student;
      if (existing[field] !== updatedData[field]) {
        auditLogs.push({
          id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          student_id: id,
          school_id: existing.school_id,
          field_name: key,
          previous_value: String(existing[field] ?? ''),
          updated_value: String(updatedData[field] ?? ''),
          reason: reason || 'Information update',
          updated_by: updatedBy || 'School Admin',
          timestamp: new Date().toISOString(),
        });
      }
    });

    const updatedStudent: Student = {
      ...existing,
      ...updatedData,
      updated_at: new Date().toISOString(),
    };

    await persistAndNotify((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? updatedStudent : s)),
      studentAuditLogs: [...auditLogs, ...prev.studentAuditLogs],
    }));

    await syncEngine.enqueueOperation({
      idempotency_key: `update_student_${id}_${Date.now()}`,
      school_id: existing.school_id,
      user_id: updatedBy,
      entity_type: 'students',
      record_id: id,
      operation_type: 'UPDATE',
      data: updatedStudent,
    });
  };

  // 3. BULK EXCEL IMPORT
  const importStudents = async (
    studentsList: Omit<Student, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<number> => {
    const created: Student[] = studentsList.map((s, idx) => ({
      ...s,
      id: `std_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await persistAndNotify((prev) => ({
      ...prev,
      students: [...created, ...prev.students],
    }));

    for (const st of created) {
      await syncEngine.enqueueOperation({
        idempotency_key: `import_student_${st.id}`,
        school_id: st.school_id,
        user_id: 'school_admin',
        entity_type: 'students',
        record_id: st.id,
        operation_type: 'CREATE',
        data: st,
      });
    }

    return created.length;
  };

  // 4. STUDENT PROMOTION WORKFLOW
  const promoteStudents = async (
    fromYear: string,
    toYear: string,
    promotions: { studentId: string; fromClass: number; toClass: number; status: 'PROMOTED' | 'RETAINED' | 'GRADUATED' }[],
    promotedBy: string
  ): Promise<void> => {
    const promotionRecords: StudentPromotionRecord[] = [];
    const newStudentsForNextYear: Student[] = [];

    promotions.forEach((p) => {
      const existing = state.students.find((s) => s.id === p.studentId);
      if (!existing) return;

      promotionRecords.push({
        id: `prom_${Date.now()}_${p.studentId}`,
        school_id: existing.school_id,
        from_year: fromYear,
        to_year: toYear,
        student_id: p.studentId,
        student_name: existing.name,
        from_class: p.fromClass,
        to_class: p.toClass,
        status: p.status,
        promoted_by: promotedBy,
        timestamp: new Date().toISOString(),
      });

      if (p.status !== 'GRADUATED') {
        newStudentsForNextYear.push({
          ...existing,
          id: `std_${toYear.replace('-', '_')}_${existing.admission_no.replace(/[^a-zA-Z0-9]/g, '_')}`,
          academic_year: toYear,
          class_number: p.status === 'PROMOTED' ? p.toClass : p.fromClass,
          status: 'ACTIVE',
          updated_at: new Date().toISOString(),
        });
      }
    });

    await persistAndNotify((prev) => ({
      ...prev,
      studentPromotions: [...promotionRecords, ...prev.studentPromotions],
      students: [...newStudentsForNextYear, ...prev.students],
    }));
  };

  // 5. SAVE ASSESSMENT MARKS
  const saveAssessmentMark = async (
    record: Omit<AssessmentRecord, 'id' | 'updated_at'>
  ): Promise<AssessmentRecord> => {
    let existingIndex = state.assessments.findIndex(
      (a) =>
        a.school_id === record.school_id &&
        a.academic_year === record.academic_year &&
        a.student_id === record.student_id &&
        a.subject_name === record.subject_name &&
        a.assessment_type === record.assessment_type
    );

    const fullRecord: AssessmentRecord = {
      ...record,
      id:
        existingIndex !== -1
          ? state.assessments[existingIndex].id
          : `mrk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      updated_at: new Date().toISOString(),
    };

    await persistAndNotify((prev) => {
      const assessmentsCopy = [...prev.assessments];
      if (existingIndex !== -1) {
        assessmentsCopy[existingIndex] = fullRecord;
      } else {
        assessmentsCopy.push(fullRecord);
      }
      return { ...prev, assessments: assessmentsCopy };
    });

    await syncEngine.enqueueOperation({
      idempotency_key: `mark_${fullRecord.student_id}_${fullRecord.subject_name}_${fullRecord.assessment_type}`,
      school_id: fullRecord.school_id,
      user_id: fullRecord.updated_by,
      entity_type: 'marks',
      record_id: fullRecord.id,
      operation_type: 'UPDATE',
      data: fullRecord,
    });

    return fullRecord;
  };

  // 6. SAVE CO-CURRICULAR GRADES
  const saveCoCurricularGrade = async (
    record: Omit<CoCurricularGradeRecord, 'id' | 'updated_at'>
  ): Promise<void> => {
    let existingIndex = state.coCurricular.findIndex(
      (c) =>
        c.school_id === record.school_id &&
        c.academic_year === record.academic_year &&
        c.student_id === record.student_id
    );

    const fullRecord: CoCurricularGradeRecord = {
      ...record,
      id:
        existingIndex !== -1
          ? state.coCurricular[existingIndex].id
          : `cc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      updated_at: new Date().toISOString(),
    };

    await persistAndNotify((prev) => {
      const coCurricularCopy = [...prev.coCurricular];
      if (existingIndex !== -1) {
        coCurricularCopy[existingIndex] = fullRecord;
      } else {
        coCurricularCopy.push(fullRecord);
      }
      return { ...prev, coCurricular: coCurricularCopy };
    });

    await syncEngine.enqueueOperation({
      idempotency_key: `cc_${fullRecord.student_id}_${fullRecord.academic_year}`,
      school_id: fullRecord.school_id,
      user_id: fullRecord.updated_by,
      entity_type: 'cocurricular',
      record_id: fullRecord.id,
      operation_type: 'UPDATE',
      data: fullRecord,
    });
  };

  // 7. CALENDAR ACTIONS
  const addCalendarEvent = async (eventData: Omit<AcademicCalendarEvent, 'id'>) => {
    const newEvent: AcademicCalendarEvent = {
      ...eventData,
      id: `cal_${Date.now()}`,
    };
    await persistAndNotify((prev) => ({
      ...prev,
      calendarEvents: [newEvent, ...prev.calendarEvents],
    }));
  };

  const deleteCalendarEvent = async (id: string) => {
    await persistAndNotify((prev) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.filter((e) => e.id !== id),
    }));
  };

  const importCalendarEvents = async (
    eventsData: Omit<AcademicCalendarEvent, 'id'>[],
    clearExisting = false
  ): Promise<number> => {
    const newItems: AcademicCalendarEvent[] = eventsData.map((e, idx) => ({
      ...e,
      id: `cal_${Date.now()}_${idx}`,
    }));
    await persistAndNotify((prev) => {
      let filtered = prev.calendarEvents;
      if (clearExisting && eventsData.length > 0) {
        const targetYear = eventsData[0].academic_year;
        const targetSchool = eventsData[0].school_id;
        filtered = prev.calendarEvents.filter(
          (e) => !(e.academic_year === targetYear && e.school_id === targetSchool)
        );
      }
      return {
        ...prev,
        calendarEvents: [...newItems, ...filtered],
      };
    });
    return newItems.length;
  };

  // 8. ABOUT SCHOOL ACTIONS
  const addAchievement = async (achievement: Omit<SchoolAchievement, 'id'>) => {
    const item: SchoolAchievement = {
      ...achievement,
      id: `ach_${Date.now()}`,
    };
    await persistAndNotify((prev) => ({
      ...prev,
      achievements: [item, ...prev.achievements],
    }));
  };

  const addConstructionWork = async (work: Omit<ConstructionWork, 'id'>) => {
    const item: ConstructionWork = {
      ...work,
      id: `cw_${Date.now()}`,
    };
    await persistAndNotify((prev) => ({
      ...prev,
      constructionWorks: [item, ...prev.constructionWorks],
    }));
  };

  const addSDMCMeeting = async (meeting: Omit<SDMCMeeting, 'id'>) => {
    const item: SDMCMeeting = {
      ...meeting,
      id: `sdmc_${Date.now()}`,
    };
    await persistAndNotify((prev) => ({
      ...prev,
      sdmcMeetings: [item, ...prev.sdmcMeetings],
    }));
  };

  const addGalleryItem = async (galleryItem: Omit<SchoolGalleryItem, 'id'>) => {
    const item: SchoolGalleryItem = {
      ...galleryItem,
      id: `gal_${Date.now()}`,
    };
    await persistAndNotify((prev) => ({
      ...prev,
      gallery: [item, ...prev.gallery],
    }));
  };

  // 9. TRANSFER CERTIFICATE (TC)
  const finalizeTransferCertificate = async (
    tcData: Omit<TransferCertificate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TransferCertificate> => {
    const tc: TransferCertificate = {
      ...tcData,
      id: `tc_${Date.now()}`,
      status: 'FINALIZED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Move student to former students
    const former: FormerStudent = {
      id: `former_${tc.student_id}`,
      school_id: tc.school_id,
      student_id: tc.student_id,
      original_admission_no: tc.sats_no || '',
      student_name: tc.student_name,
      tc_id: tc.id,
      tc_no: tc.tc_no,
      transfer_date: tc.tc_issue_date,
      class_at_transfer: tc.class_studying,
      academic_year: tc.academic_year,
      reason: 'Transfer Certificate Issued',
      correction_history: [],
    };

    await persistAndNotify((prev) => ({
      ...prev,
      transferCertificates: [tc, ...prev.transferCertificates],
      formerStudents: [former, ...prev.formerStudents],
      students: prev.students.map((s) => (s.id === tc.student_id ? { ...s, status: 'TRANSFERRED' } : s)),
    }));

    return tc;
  };

  // 9b. UPDATE FORMER STUDENT (WITH SATS AUDIT TRAIL & CORRECTION LOG)
  const updateFormerStudent = async (
    id: string,
    updatedData: Partial<FormerStudent>,
    reason: string,
    updatedBy: string
  ): Promise<void> => {
    const existing = state.formerStudents.find((f) => f.id === id);
    if (!existing) return;

    const auditLogs: StudentAuditLog[] = [];
    const newCorrectionHistory = [...(existing.correction_history || [])];

    Object.keys(updatedData).forEach((key) => {
      const field = key as keyof FormerStudent;
      if (key !== 'correction_history' && existing[field] !== updatedData[field]) {
        const oldVal = String(existing[field] ?? '');
        const newVal = String(updatedData[field] ?? '');

        auditLogs.push({
          id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          student_id: existing.student_id || existing.id,
          school_id: existing.school_id,
          field_name: `former_student_${key}`,
          previous_value: oldVal,
          updated_value: newVal,
          reason: reason || 'Former student record update',
          updated_by: updatedBy || 'School Admin',
          timestamp: new Date().toISOString(),
        });

        newCorrectionHistory.push({
          field: key,
          old_value: oldVal,
          new_value: newVal,
          reason: reason || 'Administrative edit',
          approver: updatedBy || 'School Admin',
          approved_at: new Date().toISOString(),
        });
      }
    });

    const updatedFormer: FormerStudent = {
      ...existing,
      ...updatedData,
      correction_history: newCorrectionHistory,
    };

    await persistAndNotify((prev) => ({
      ...prev,
      formerStudents: prev.formerStudents.map((f) => (f.id === id ? updatedFormer : f)),
      studentAuditLogs: [...auditLogs, ...prev.studentAuditLogs],
    }));

    await syncEngine.enqueueOperation({
      idempotency_key: `update_former_student_${id}_${Date.now()}`,
      school_id: existing.school_id,
      user_id: updatedBy,
      entity_type: 'former_students',
      record_id: id,
      operation_type: 'UPDATE',
      data: updatedFormer,
    });
  };

  // 10. STUDY CERTIFICATE
  const issueStudyCertificate = async (
    certData: Omit<StudyCertificate, 'id' | 'created_at'>
  ): Promise<StudyCertificate> => {
    const cert: StudyCertificate = {
      ...certData,
      id: `cert_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    await persistAndNotify((prev) => ({
      ...prev,
      studyCertificates: [cert, ...prev.studyCertificates],
    }));

    return cert;
  };

  // 11. PLATFORM ADMIN: REGISTER, APPROVE, REVOKE, REACTIVATE
  const registerSchool = async (
    schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>
  ): Promise<School> => {
    const newSchool: School = {
      ...schoolData,
      id: `school_${Date.now()}`,
      status: 'PENDING_APPROVAL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await persistAndNotify((prev) => ({
      ...prev,
      schools: [newSchool, ...prev.schools],
    }));

    return newSchool;
  };

  const approveSchool = async (schoolId: string, performedBy: string) => {
    const updatedTime = new Date().toISOString();
    let computedExpiry = '2027-04-30';
    await persistAndNotify((prev) => {
      const targetSchool = prev.schools.find((s) => s.id === schoolId);
      computedExpiry = calculateAcademicYearExpiry(targetSchool?.current_academic_year);
      return {
        ...prev,
        schools: prev.schools.map((s) =>
          s.id === schoolId
            ? { ...s, status: 'ACTIVE', expiry_date: computedExpiry, updated_at: updatedTime }
            : s
        ),
        users: prev.users.map((u) =>
          u.school_id === schoolId && (u.status === 'PENDING' || !u.status)
            ? { ...u, status: 'ACTIVE', updated_at: updatedTime }
            : u
        ),
      };
    });

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client
          .from('schools')
          .update({ status: 'ACTIVE', expiry_date: computedExpiry, updated_at: updatedTime })
          .eq('id', schoolId);
        await client
          .from('users')
          .update({ status: 'ACTIVE', updated_at: updatedTime })
          .eq('school_id', schoolId);
      } catch (err) {
        console.warn('Could not sync school approval to Supabase:', err);
      }
    }
  };

  const revokeSchoolAccess = async (schoolId: string, reason: string = 'Payment cycle ended', performedBy: string = 'Platform Admin') => {
    const updatedTime = new Date().toISOString();
    await persistAndNotify((prev) => ({
      ...prev,
      schools: prev.schools.map((s) =>
        s.id === schoolId
          ? { ...s, status: 'REVOKED', updated_at: updatedTime }
          : s
      ),
      users: prev.users.map((u) =>
        u.school_id === schoolId
          ? { ...u, status: 'REVOKED', updated_at: updatedTime }
          : u
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client
          .from('schools')
          .update({ status: 'REVOKED', updated_at: updatedTime })
          .eq('id', schoolId);
        await client
          .from('users')
          .update({ status: 'REVOKED', updated_at: updatedTime })
          .eq('school_id', schoolId);
      } catch (err) {
        console.warn('Could not sync school revocation to Supabase:', err);
      }
    }
  };

  const reactivateSchoolAccess = async (schoolId: string, performedBy: string) => {
    const updatedTime = new Date().toISOString();
    await persistAndNotify((prev) => ({
      ...prev,
      schools: prev.schools.map((s) =>
        s.id === schoolId
          ? { ...s, status: 'ACTIVE', updated_at: updatedTime }
          : s
      ),
      users: prev.users.map((u) =>
        u.school_id === schoolId
          ? { ...u, status: 'ACTIVE', updated_at: updatedTime }
          : u
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client
          .from('schools')
          .update({ status: 'ACTIVE', updated_at: updatedTime })
          .eq('id', schoolId);
        await client
          .from('users')
          .update({ status: 'ACTIVE', updated_at: updatedTime })
          .eq('school_id', schoolId);
      } catch (err) {
        console.warn('Could not sync school reactivation to Supabase:', err);
      }
    }
  };

  // 12. FACULTY MANAGEMENT
  const addFacultyUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      status: 'ACTIVE',
      activation_token: `token_${Math.random().toString(36).substring(2, 10)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await persistAndNotify((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));

    return newUser;
  };

  const toggleFacultyStatus = async (userId: string, newStatus: 'ACTIVE' | 'REVOKED') => {
    await persistAndNotify((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
    }));
  };

  // 13. SYNC & BACKUP CONTROLS
  const triggerManualSync = async () => {
    await syncEngine.triggerAutoSync();
  };

  const toggleOfflineSimulator = (): boolean => {
    return syncEngine.toggleSimulatedOffline();
  };

  const downloadBackupJSON = () => {
    if (typeof window === 'undefined') return;
    const cleanFilename = `karnataka_cce_backup_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });

    if (typeof (window.navigator as any)?.msSaveOrOpenBlob === 'function') {
      (window.navigator as any).msSaveOrOpenBlob(blob, cleanFilename);
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = cleanFilename;
    a.setAttribute('download', cleanFilename);
    a.rel = 'noopener';
    document.body.appendChild(a);

    if (typeof MouseEvent !== 'undefined') {
      const evt = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
      a.dispatchEvent(evt);
    } else {
      a.click();
    }

    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 60000);
  };

  const restoreBackupJSON = async (jsonData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonData) as ERPStorageState;
      if (parsed.schools && parsed.students) {
        await erpLocalDB.persistState(parsed);
        setState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const refreshState = async () => {
    const loaded = await erpLocalDB.loadState();
    setState(loaded);
  };

  const pullCloudData = async () => {
    const res = await syncEngine.pullCloudDataToLocal();
    if (res.success) {
      await refreshState();
    }
    return res;
  };

  return (
    <AppStateContext.Provider
      value={{
        state,
        syncStatus,
        isLoading,
        addStudent,
        updateStudent,
        importStudents,
        promoteStudents,
        saveAssessmentMark,
        saveCoCurricularGrade,
        addCalendarEvent,
        deleteCalendarEvent,
        importCalendarEvents,
        addAchievement,
        addConstructionWork,
        addSDMCMeeting,
        addGalleryItem,
        finalizeTransferCertificate,
        updateFormerStudent,
        issueStudyCertificate,
        registerSchool,
        approveSchool,
        revokeSchoolAccess,
        reactivateSchoolAccess,
        addFacultyUser,
        toggleFacultyStatus,
        triggerManualSync,
        pullCloudData,
        toggleOfflineSimulator,
        downloadBackupJSON,
        restoreBackupJSON,
        refreshState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
