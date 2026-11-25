import { SyncOperation, SyncState } from '../types';
import { erpLocalDB, ERPStorageState } from './indexedDB';
import { isSupabaseConfigured, getSupabaseClient } from './supabaseClient';

export interface SyncEngineStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  syncState: SyncState;
  pendingCount: number;
  lastSyncTime: string | null;
  lastSyncError: string | null;
  failedCount: number;
}

type StatusListener = (status: SyncEngineStatus) => void;

export interface WritePermissionCheckResult {
  ok: boolean;
  errorType?: 'RLS' | 'UUID' | 'TABLE_MISSING' | 'NETWORK' | 'UNKNOWN';
  message: string;
  code?: string;
  details?: string | null;
}

class SyncEngine {
  private isSimulatedOffline: boolean = false;
  private syncState: SyncState = 'SAVED_LOCAL';
  private lastSyncTime: string | null = null;
  private lastSyncError: string | null = null;
  private listeners: Set<StatusListener> = new Set();
  private isSyncing: boolean = false;
  private autoSyncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
      this.lastSyncTime = localStorage.getItem('last_sync_timestamp') || new Date().toISOString();

      // Initial automatic sync on application startup if online and Cloud is configured
      setTimeout(() => {
        if (this.getStatus().isOnline && isSupabaseConfigured()) {
          this.triggerAutoSync();
        }
      }, 1500);

      // Periodic background sync heartbeat (runs every 60s) to guarantee automatic sync without user intervention
      setInterval(() => {
        if (this.getStatus().isOnline && isSupabaseConfigured() && !this.isSyncing) {
          this.triggerAutoSync();
        }
      }, 60000);
    }
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => fn(status));
  }

  public getStatus(): SyncEngineStatus {
    const realOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const effectiveOnline = realOnline && !this.isSimulatedOffline;

    return {
      isOnline: effectiveOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      syncState: this.syncState,
      pendingCount: 0,
      lastSyncTime: this.lastSyncTime,
      lastSyncError: this.lastSyncError,
      failedCount: 0,
    };
  }

  public toggleSimulatedOffline(forcedState?: boolean): boolean {
    this.isSimulatedOffline = forcedState !== undefined ? forcedState : !this.isSimulatedOffline;
    this.handleNetworkChange();
    return this.isSimulatedOffline;
  }

  public handleNetworkChange() {
    const status = this.getStatus();
    if (status.isOnline) {
      console.log('Internet connected: Automatically initiating cloud synchronization...');
      this.scheduleAutoSync(300);
    } else {
      console.log('Internet disconnected: Operating in offline mode. Changes saved locally to IndexedDB.');
      this.syncState = 'WAITING_INTERNET';
      this.notify();
    }
  }

  public scheduleAutoSync(delayMs: number = 800) {
    if (typeof window === 'undefined') return;
    if (this.autoSyncTimer) clearTimeout(this.autoSyncTimer);
    this.autoSyncTimer = setTimeout(() => {
      this.triggerAutoSync();
    }, delayMs);
  }

  public async enqueueOperation(
    op: Omit<SyncOperation, 'op_id' | 'timestamp' | 'status' | 'retry_count'>
  ): Promise<SyncOperation> {
    const op_id = `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fullOp: SyncOperation = {
      ...op,
      op_id,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      retry_count: 0,
    };

    const state = await erpLocalDB.loadState();
    state.syncQueue.push(fullOp);
    await erpLocalDB.persistState(state);

    if (this.getStatus().isOnline && isSupabaseConfigured()) {
      this.scheduleAutoSync(400);
    } else {
      this.syncState = 'WAITING_INTERNET';
      this.notify();
    }

    return fullOp;
  }

  /**
   * Tests actual WRITE capability against the Supabase database.
   * Diagnoses RLS blocks (42501), UUID mismatches (22P02), or missing tables.
   */
  public async testCloudWritePermission(): Promise<WritePermissionCheckResult> {
    if (!isSupabaseConfigured()) {
      return {
        ok: false,
        errorType: 'NETWORK',
        message: 'Cloud credentials are not configured or invalid.',
      };
    }

    const client = getSupabaseClient();
    const probeId = `__probe_${Date.now()}__`;
    const probeUdise = `probe_${Math.random().toString(36).substring(2, 8)}`;

    try {
      // 1. First test SELECT permission
      const { error: readErr } = await client.from('schools').select('id').limit(1);
      if (readErr) {
        if (readErr.code === 'PGRST204' || readErr.message.includes('Could not find')) {
          return {
            ok: false,
            errorType: 'TABLE_MISSING',
            message: 'Tables do not exist in Cloud yet. Please run the SQL Setup Script in your Cloud SQL Editor.',
            code: readErr.code,
            details: readErr.details,
          };
        }
        return {
          ok: false,
          errorType: 'NETWORK',
          message: `Read check failed: ${readErr.message}`,
          code: readErr.code,
          details: readErr.details,
        };
      }

      // 2. Test actual UPSERT / WRITE permission with alphanumeric string ID
      const { error: writeErr } = await client.from('schools').upsert({
        id: probeId,
        udise: probeUdise,
        name: 'Probe Connection Check School',
        hm_name: 'Probe',
        hm_phone: '9999999999',
        taluk: 'Diagnostics',
        district: 'Diagnostics',
        state: 'Karnataka',
        status: 'ACTIVE',
      });

      if (writeErr) {
        // Diagnosis based on Postgres error code
        if (writeErr.code === '42501' || writeErr.message.includes('row-level security')) {
          return {
            ok: false,
            errorType: 'RLS',
            message:
              'Row Level Security (RLS) is enabled in Cloud and blocking cloud writes. Please run fix_supabase_schema.sql in your Cloud SQL Editor to disable RLS and allow writes.',
            code: writeErr.code,
            details: writeErr.details,
          };
        }

        if (writeErr.code === '22P02' || writeErr.message.includes('uuid')) {
          return {
            ok: false,
            errorType: 'UUID',
            message:
              'Cloud tables have UUID primary keys instead of VARCHAR identifiers. Please run fix_supabase_schema.sql in your Cloud SQL Editor to recreate tables with VARCHAR support.',
            code: writeErr.code,
            details: writeErr.details,
          };
        }

        return {
          ok: false,
          errorType: 'UNKNOWN',
          message: `Write check failed (${writeErr.code}): ${writeErr.message}`,
          code: writeErr.code,
          details: writeErr.details,
        };
      }

      // 3. Clean up probe row
      await client.from('schools').delete().eq('id', probeId);

      return {
        ok: true,
        message: 'Verified! Cloud read & write access is fully operational.',
      };
    } catch (err: any) {
      return {
        ok: false,
        errorType: 'NETWORK',
        message: `Network or client connection failure: ${err?.message || 'Check your internet connection'}`,
      };
    }
  }

  public async triggerAutoSync(): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    if (this.isSyncing) return { success: true, syncedCount: 0, errors: [] };
    const status = this.getStatus();

    if (!status.isOnline) {
      this.syncState = 'WAITING_INTERNET';
      this.notify();
      return { success: false, syncedCount: 0, errors: ['Offline'] };
    }

    if (!isSupabaseConfigured()) {
      this.syncState = 'SAVED_LOCAL';
      this.notify();
      return { success: true, syncedCount: 0, errors: [] };
    }

    this.isSyncing = true;
    this.syncState = 'SAVING';
    this.notify();

    const errors: string[] = [];
    let syncedCount = 0;

    try {
      const state = await erpLocalDB.loadState();
      const pendingOps = state.syncQueue.filter((op) => op.status === 'PENDING' || op.status === 'FAILED');
      const client = getSupabaseClient();

      for (const op of pendingOps) {
        try {
          const tableName = getSupabaseTableName(op.entity_type);
          const payload = formatForSupabase(tableName, op.data);

          let res: { error: any } = { error: null };
          if (op.operation_type === 'CREATE' || op.operation_type === 'UPDATE') {
            const upsertOptions: any = {};
            if (tableName === 'assessment_records') {
              upsertOptions.onConflict = 'school_id,academic_year,student_id,subject_name,assessment_type';
            } else if (tableName === 'co_curricular_grades') {
              upsertOptions.onConflict = 'school_id,academic_year,student_id';
            } else if (tableName === 'students') {
              upsertOptions.onConflict = 'school_id,admission_no,academic_year';
            }
            const { error } = await client.from(tableName).upsert(payload, upsertOptions);
            res.error = error;
          } else if (op.operation_type === 'DELETE') {
            const { error } = await client.from(tableName).delete().eq('id', op.record_id);
            res.error = error;
          }

          if (res.error) {
            console.error(`Auto-sync item rejected (${tableName}):`, res.error.message);
            op.status = 'FAILED';
            op.retry_count = (op.retry_count || 0) + 1;
            errors.push(`${op.entity_type}: ${res.error.message}`);
          } else {
            op.status = 'SYNCED';
            syncedCount++;
          }
        } catch (err: any) {
          console.warn(`Auto-sync exception (${op.entity_type}):`, err?.message);
          op.status = 'FAILED';
          op.retry_count = (op.retry_count || 0) + 1;
          errors.push(`${op.entity_type}: ${err?.message}`);
        }
      }

      // Remove only successfully synced operations from queue
      state.syncQueue = state.syncQueue.filter((op) => op.status !== 'SYNCED');
      await erpLocalDB.persistState(state);

      // Auto-upload local data to cloud in background
      const pushRes = await this.pushAllLocalDataToCloud();
      if (!pushRes.success) {
        errors.push(pushRes.message);
      }

      // Auto-pull fresh cloud data from other users in background without intervention
      try {
        await this.pullCloudDataToLocal();
      } catch (pullErr: any) {
        console.warn('Background auto-pull from cloud:', pullErr?.message);
      }

      if (errors.length > 0) {
        this.syncState = 'SYNC_FAILED';
        this.lastSyncError = errors.join('; ');
      } else {
        this.syncState = 'SYNCED_CLOUD';
        this.lastSyncError = null;
        this.lastSyncTime = new Date().toISOString();
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_sync_timestamp', this.lastSyncTime);
        }
      }

      this.notify();

      return {
        success: errors.length === 0,
        syncedCount,
        errors,
      };
    } catch (err: any) {
      console.warn('Auto-sync caught error:', err?.message);
      this.syncState = 'SYNC_FAILED';
      this.lastSyncError = err?.message || 'Sync error';
      this.notify();
      return { success: false, syncedCount: 0, errors: [this.lastSyncError || 'Sync error'] };
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  /**
   * Pushes ALL local IndexedDB collections to Supabase Cloud.
   * Accurately verifies errors and updates counts ONLY on actual success.
   */
  public async pushAllLocalDataToCloud(
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; message: string; counts: Record<string, number>; errors?: string[] }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Cloud credentials are not configured or invalid. Please check your credentials.',
        counts: {},
      };
    }

    const client = getSupabaseClient();
    const state = await erpLocalDB.loadState();
    const counts: Record<string, number> = {};
    const syncErrors: string[] = [];

    try {
      // 1. Schools
      if (state.schools && state.schools.length > 0) {
        onProgress?.(`Uploading ${state.schools.length} schools...`);
        const { error } = await client.from('schools').upsert(
          state.schools.map((s) => ({
            id: s.id,
            udise: s.udise,
            name: s.name,
            name_kannada: s.name_kannada || null,
            hm_name: s.hm_name,
            hm_name_kannada: s.hm_name_kannada || null,
            hm_phone: s.hm_phone,
            email: s.email || null,
            taluk: s.taluk,
            taluk_kannada: s.taluk_kannada || null,
            district: s.district,
            district_kannada: s.district_kannada || null,
            state: s.state || 'Karnataka',
            description: s.description || null,
            description_kannada: s.description_kannada || null,
            status: s.status,
            current_academic_year: s.current_academic_year,
            working_days_by_year: s.working_days_by_year || {},
            expiry_date: s.expiry_date || null,
          }))
        );
        if (error) {
          syncErrors.push(`schools: ${error.message}`);
        } else {
          counts.schools = state.schools.length;
        }
      }

      // 2. Users (Faculty & Staff)
      if (state.users && state.users.length > 0) {
        onProgress?.(`Uploading ${state.users.length} users/faculty...`);
        const { error } = await client.from('users').upsert(
          state.users.map((u) => ({
            id: u.id,
            school_id: u.school_id || null,
            role: u.role,
            name: u.name,
            name_kannada: u.name_kannada || null,
            phone: u.phone,
            email: u.email || null,
            designation: u.designation || 'Teacher',
            designation_kannada: u.designation_kannada || null,
            status: u.status,
            activation_token: u.activation_token || null,
            token_expiry: u.token_expiry || null,
          }))
        );
        if (error) {
          syncErrors.push(`users: ${error.message}`);
        } else {
          counts.users = state.users.length;
        }
      }

      // 3. Students
      if (state.students && state.students.length > 0) {
        onProgress?.(`Uploading ${state.students.length} student records...`);
        const formattedStudents = state.students.map((st) => ({
          id: st.id,
          school_id: st.school_id,
          academic_year: st.academic_year,
          admission_no: st.admission_no,
          sats_no: st.sats_no,
          pen_no: st.pen_no || null,
          apaar_id: st.apaar_id || null,
          aadhaar_no: st.aadhaar_no || null,
          name: st.name,
          name_kannada: st.name_kannada || null,
          gender: st.gender,
          dob: st.dob,
          religion: st.religion || 'Hindu',
          category: st.category,
          caste: st.caste || null,
          caste_kannada: st.caste_kannada || null,
          sub_caste: st.sub_caste || null,
          father_name: st.father_name || null,
          father_name_kannada: st.father_name_kannada || null,
          mother_name: st.mother_name || null,
          mother_name_kannada: st.mother_name_kannada || null,
          cwsn: Boolean(st.cwsn),
          mobile: st.mobile || null,
          class_number: Number(st.class_number),
          section: st.section || 'A',
          place_of_birth: st.place_of_birth || null,
          place_of_birth_kannada: st.place_of_birth_kannada || null,
          taluk: st.taluk || null,
          taluk_kannada: st.taluk_kannada || null,
          district: st.district || null,
          district_kannada: st.district_kannada || null,
          state: st.state || 'Karnataka',
          nationality: st.nationality || 'Indian',
          medium_of_instruction: st.medium_of_instruction || 'Kannada',
          admission_date: st.admission_date || null,
          status: st.status || 'ACTIVE',
        }));

        let studentSuccess = true;
        for (let i = 0; i < formattedStudents.length; i += 50) {
          const chunk = formattedStudents.slice(i, i + 50);
          const { error } = await client.from('students').upsert(chunk);
          if (error) {
            syncErrors.push(`students chunk: ${error.message}`);
            studentSuccess = false;
            break;
          }
        }
        if (studentSuccess) {
          counts.students = state.students.length;
        }
      }

      // 4. Assessment Records (Marks)
      if (state.assessments && state.assessments.length > 0) {
        onProgress?.(`Uploading ${state.assessments.length} assessment records...`);
        const formattedMarks = state.assessments.map((a) => formatForSupabase('assessment_records', a));
        
        // Deduplicate records by composite unique key before sending chunks
        const dedupedMarks: any[] = [];
        const seenMarkKeys = new Set<string>();
        for (const m of formattedMarks) {
          const k = `${m.school_id}_${m.academic_year}_${m.student_id}_${m.subject_name}_${m.assessment_type}`;
          if (!seenMarkKeys.has(k)) {
            seenMarkKeys.add(k);
            dedupedMarks.push(m);
          }
        }

        let marksSuccess = true;
        for (let i = 0; i < dedupedMarks.length; i += 50) {
          const chunk = dedupedMarks.slice(i, i + 50);
          const { error } = await client.from('assessment_records').upsert(chunk, {
            onConflict: 'school_id,academic_year,student_id,subject_name,assessment_type',
          });
          if (error) {
            syncErrors.push(`assessment_records chunk: ${error.message}`);
            marksSuccess = false;
            break;
          }
        }
        if (marksSuccess) {
          counts.assessments = dedupedMarks.length;
        }
      }

      // 5. Co-Curricular Grades
      if (state.coCurricular && state.coCurricular.length > 0) {
        onProgress?.(`Uploading ${state.coCurricular.length} co-curricular grades...`);
        const { error } = await client.from('co_curricular_grades').upsert(
          state.coCurricular.map((c) => ({
            id: c.id,
            school_id: c.school_id,
            student_id: c.student_id,
            academic_year: c.academic_year,
            class_number: Number(c.class_number),
            daihika_arogya: c.daihika_arogya || 'A',
            moulya: c.moulya || 'A',
            kaaryanubhava: c.kaaryanubhava || 'A',
            kala: c.kala || 'A',
            updated_by: c.updated_by || null,
          }))
        );
        if (error) {
          syncErrors.push(`co_curricular_grades: ${error.message}`);
        } else {
          counts.coCurricular = state.coCurricular.length;
        }
      }

      // 6. Academic Calendar Events
      if (state.calendarEvents && state.calendarEvents.length > 0) {
        onProgress?.(`Uploading ${state.calendarEvents.length} calendar events...`);
        const calPayload = state.calendarEvents.map((ev) => ({
          id: ev.id,
          school_id: ev.school_id,
          academic_year: ev.academic_year,
          title: ev.title,
          title_kannada: ev.title_kannada || null,
          description: ev.description || null,
          description_kannada: ev.description_kannada || null,
          date: ev.date,
          end_date: ev.end_date || null,
          category: ev.category,
          is_official: Boolean(ev.is_official),
          created_by: ev.created_by || null,
        }));
        let { error } = await client.from('academic_calendar_events').upsert(calPayload);
        if (error && error.message.includes('Could not find')) {
          const fallback = await client.from('academic_calendar').upsert(calPayload);
          error = fallback.error;
        }
        if (error) {
          syncErrors.push(`calendar_events: ${error.message}`);
        } else {
          counts.calendarEvents = state.calendarEvents.length;
        }
      }

      // 7. Audit Logs (Edit Reasons)
      if (state.studentAuditLogs && state.studentAuditLogs.length > 0) {
        onProgress?.(`Uploading ${state.studentAuditLogs.length} audit logs...`);
        const { error } = await client.from('student_audit_logs').upsert(
          state.studentAuditLogs.map((log) => ({
            id: log.id,
            student_id: log.student_id,
            school_id: log.school_id,
            field_name: log.field_name,
            previous_value: log.previous_value !== undefined ? String(log.previous_value) : null,
            updated_value: log.updated_value !== undefined ? String(log.updated_value) : null,
            reason: log.reason,
            updated_by: log.updated_by,
            timestamp: log.timestamp || new Date().toISOString(),
          }))
        );
        if (error) {
          syncErrors.push(`student_audit_logs: ${error.message}`);
        } else {
          counts.studentAuditLogs = state.studentAuditLogs.length;
        }
      }

      // 8. Former Students (TC Issued)
      if (state.formerStudents && state.formerStudents.length > 0) {
        onProgress?.(`Uploading ${state.formerStudents.length} former student archives...`);
        const { error } = await client.from('former_students').upsert(
          state.formerStudents.map((fs) => ({
            id: fs.id,
            school_id: fs.school_id,
            student_id: fs.student_id,
            original_admission_no: fs.original_admission_no,
            student_name: fs.student_name,
            tc_id: fs.tc_id || null,
            tc_no: fs.tc_no,
            transfer_date: fs.transfer_date,
            class_at_transfer: Number(fs.class_at_transfer),
            academic_year: fs.academic_year,
            reason: fs.reason || null,
            correction_history: fs.correction_history || [],
          }))
        );
        if (error) {
          syncErrors.push(`former_students: ${error.message}`);
        } else {
          counts.formerStudents = state.formerStudents.length;
        }
      }

      // 9. Achievements
      if (state.achievements && state.achievements.length > 0) {
        onProgress?.(`Uploading ${state.achievements.length} achievements...`);
        const { error } = await client.from('school_achievements').upsert(
          state.achievements.map((a) => ({
            id: a.id,
            school_id: a.school_id,
            academic_year: a.academic_year,
            title: a.title,
            title_kannada: a.title_kannada || null,
            category: a.category,
            student_name: a.student_name,
            student_name_kannada: a.student_name_kannada || null,
            class_number: Number(a.class_number || 10),
            description: a.description || null,
            description_kannada: a.description_kannada || null,
            date: a.date,
            photo_url: a.photo_url || null,
          }))
        );
        if (error) {
          syncErrors.push(`school_achievements: ${error.message}`);
        } else {
          counts.achievements = state.achievements.length;
        }
      }

      // 10. Transfer Certificates
      if (state.transferCertificates && state.transferCertificates.length > 0) {
        onProgress?.(`Uploading ${state.transferCertificates.length} transfer certificates...`);
        // Deduplicate in batch by tc_no to prevent unique constraint crashes
        const tcMap = new Map<string, typeof state.transferCertificates[0]>();
        for (const tc of state.transferCertificates) {
          const tcKey = tc.tc_no?.trim() || `TC_${tc.id}`;
          tcMap.set(tcKey, { ...tc, tc_no: tcKey });
        }
        const deduplicatedTCs = Array.from(tcMap.values());

        const { error } = await client.from('transfer_certificates').upsert(
          deduplicatedTCs.map((tc) => ({
            id: tc.id,
            tc_no: tc.tc_no,
            school_id: tc.school_id,
            student_id: tc.student_id,
            sanchita_dakhale_no: tc.sanchita_dakhale_no || null,
            fee_discount: tc.fee_discount || null,
            scholarship: tc.scholarship || null,
            medical_test_info: tc.medical_test_info || null,
            last_attendance_date: tc.last_attendance_date || null,
            tc_application_date: tc.tc_application_date,
            tc_issue_date: tc.tc_issue_date,
            total_working_days: Number(tc.total_working_days || 220),
            days_attended: Number(tc.days_attended || 200),
            behaviour: tc.behaviour || 'Good',
            reason_for_leaving: 'Transfer Certificate Issued',
            promoted_to_higher_class: tc.whether_promoted === 'Yes',
          })),
          { onConflict: 'tc_no' }
        );
        if (error) {
          syncErrors.push(`transfer_certificates: ${error.message}`);
        } else {
          counts.transferCertificates = deduplicatedTCs.length;
        }
      }

      // 11. Study Certificates
      if (state.studyCertificates && state.studyCertificates.length > 0) {
        onProgress?.(`Uploading ${state.studyCertificates.length} study certificates...`);
        // Deduplicate in batch by certificate_no to prevent unique constraint crashes
        const certMap = new Map<string, typeof state.studyCertificates[0]>();
        for (const sc of state.studyCertificates) {
          const certKey = sc.certificate_no?.trim() || `SC_${sc.id}`;
          certMap.set(certKey, { ...sc, certificate_no: certKey });
        }
        const deduplicatedCerts = Array.from(certMap.values());

        const { error } = await client.from('study_certificates').upsert(
          deduplicatedCerts.map((sc) => ({
            id: sc.id,
            certificate_no: sc.certificate_no,
            school_id: sc.school_id,
            student_id: sc.student_id,
            purpose: 'Study & Conduct Verification',
            status_type: sc.status_type || 'Currently Studying',
            from_year: sc.academic_year || null,
            to_year: sc.academic_year || null,
            from_class: Number(sc.class_studying || 1),
            to_class: Number(sc.class_studying || 10),
            place_of_issue: sc.place_of_issue || null,
            issue_date: sc.issue_date,
            language: sc.language || 'EN',
          })),
          { onConflict: 'certificate_no' }
        );
        if (error) {
          syncErrors.push(`study_certificates: ${error.message}`);
        } else {
          counts.studyCertificates = deduplicatedCerts.length;
        }
      }

      // 12. Construction Works
      if (state.constructionWorks && state.constructionWorks.length > 0) {
        onProgress?.(`Uploading ${state.constructionWorks.length} construction works...`);
        const { error } = await client.from('construction_works').upsert(
          state.constructionWorks.map((cw) => ({
            id: cw.id,
            school_id: cw.school_id,
            academic_year: cw.academic_year,
            title: cw.title,
            title_kannada: cw.title_kannada || null,
            description: cw.description || null,
            description_kannada: cw.description_kannada || null,
            date: cw.date,
            estimated_cost: Number(cw.estimated_cost || 0),
            completion_status: cw.completion_status || 'IN_PROGRESS',
          }))
        );
        if (error) {
          syncErrors.push(`construction_works: ${error.message}`);
        } else {
          counts.constructionWorks = state.constructionWorks.length;
        }
      }

      // 13. SDMC Meetings
      if (state.sdmcMeetings && state.sdmcMeetings.length > 0) {
        onProgress?.(`Uploading ${state.sdmcMeetings.length} SDMC meetings...`);
        const { error } = await client.from('sdmc_meetings').upsert(
          state.sdmcMeetings.map((sm) => ({
            id: sm.id,
            school_id: sm.school_id,
            academic_year: sm.academic_year,
            title: sm.title,
            title_kannada: sm.title_kannada || null,
            date: sm.date,
            agenda: sm.agenda || null,
            agenda_kannada: sm.agenda_kannada || null,
            summary: sm.summary || null,
            summary_kannada: sm.summary_kannada || null,
            decisions_taken: sm.decisions_taken || null,
            decisions_taken_kannada: sm.decisions_taken_kannada || null,
          }))
        );
        if (error) {
          syncErrors.push(`sdmc_meetings: ${error.message}`);
        } else {
          counts.sdmcMeetings = state.sdmcMeetings.length;
        }
      }

      // 14. School Gallery
      if (state.gallery && state.gallery.length > 0) {
        onProgress?.(`Uploading ${state.gallery.length} gallery items...`);
        const { error } = await client.from('school_gallery').upsert(
          state.gallery.map((g: any) => ({
            id: g.id,
            school_id: g.school_id,
            academic_year: g.academic_year,
            title: g.title,
            title_kannada: g.title_kannada || null,
            description: g.description || null,
            description_kannada: g.description_kannada || null,
            date: g.date,
            photo_url: g.photo_url || g.photoUrl || null,
          }))
        );
        if (error) {
          syncErrors.push(`school_gallery: ${error.message}`);
        } else {
          counts.gallery = state.gallery.length;
        }
      }

      const isCompleteSuccess = syncErrors.length === 0;
      this.syncState = isCompleteSuccess ? 'SYNCED_CLOUD' : 'SYNC_FAILED';
      this.lastSyncError = isCompleteSuccess ? null : syncErrors.join(' | ');
      this.lastSyncTime = new Date().toISOString();

      if (typeof window !== 'undefined') {
        localStorage.setItem('last_sync_timestamp', this.lastSyncTime);
      }
      this.notify();

      let message = 'All local records successfully synced to Cloud!';
      if (!isCompleteSuccess) {
        const isRlsError = syncErrors.some((e) => e.includes('row-level security') || e.includes('42501'));
        const isUuidError = syncErrors.some((e) => e.includes('uuid') || e.includes('22P02'));

        if (isRlsError) {
          message =
            'Cloud write blocked by Cloud Row-Level Security (RLS). Please run fix_supabase_schema.sql in your Cloud SQL Editor.';
        } else if (isUuidError) {
          message =
            'Cloud write blocked by UUID column type mismatch in Cloud. Please run fix_supabase_schema.sql in your Cloud SQL Editor.';
        } else {
          message = `Cloud sync encountered errors in: ${syncErrors.join(', ')}`;
        }
      }

      return {
        success: isCompleteSuccess,
        message,
        counts,
        errors: syncErrors,
      };
    } catch (err: any) {
      console.warn('Push all notice:', err?.message);
      this.syncState = 'SYNC_FAILED';
      this.lastSyncError = err?.message || 'Notice during cloud sync';
      this.notify();
      return {
        success: false,
        message: err?.message || 'Error occurred during cloud sync',
        counts,
        errors: [err?.message || 'Unknown error'],
      };
    }
  }

  /**
   * Pulls data from Cloud down into local storage state.
   */
  public async pullCloudDataToLocal(
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; message: string; counts: Record<string, number> }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Cloud credentials are not configured or invalid.',
        counts: {},
      };
    }

    const client = getSupabaseClient();
    const currentState = await erpLocalDB.loadState();
    const counts: Record<string, number> = {};

    try {
      // 1. Schools
      onProgress?.('Fetching schools from Cloud...');
      const { data: schoolsData, error: sErr } = await client.from('schools').select('*');
      if (!sErr && schoolsData && schoolsData.length > 0) {
        const cloudMap = new Map(schoolsData.map((s: any) => [s.id, s]));
        const mergedSchools = currentState.schools.map((localSchool) => {
          const cloudSchool = cloudMap.get(localSchool.id);
          if (!cloudSchool) return localSchool;
          cloudMap.delete(localSchool.id);
          // If local has newer timestamp, keep local status and fields
          const localTime = new Date(localSchool.updated_at || 0).getTime();
          const cloudTime = new Date(cloudSchool.updated_at || 0).getTime();
          return localTime >= cloudTime ? localSchool : { ...localSchool, ...cloudSchool };
        });
        // Append any new schools from cloud not present locally
        for (const remainingCloudSchool of cloudMap.values()) {
          mergedSchools.push(remainingCloudSchool as any);
        }
        currentState.schools = mergedSchools;
        counts.schools = schoolsData.length;
      }

      // 2. Users
      onProgress?.('Fetching faculty from Cloud...');
      const { data: usersData, error: uErr } = await client.from('users').select('*');
      if (!uErr && usersData && usersData.length > 0) {
        const existingIds = new Set(usersData.map((u: any) => u.id));
        const kept = currentState.users.filter((u) => !existingIds.has(u.id));
        currentState.users = [...usersData, ...kept];
        counts.users = usersData.length;
      }

      // 3. Students
      onProgress?.('Fetching students from Cloud...');
      const { data: studentsData, error: stErr } = await client.from('students').select('*');
      if (!stErr && studentsData && studentsData.length > 0) {
        const existingIds = new Set(studentsData.map((st: any) => st.id));
        const kept = currentState.students.filter((st) => !existingIds.has(st.id));
        currentState.students = [...studentsData, ...kept];
        counts.students = studentsData.length;
      }

      // 4. Assessment Records
      onProgress?.('Fetching marks from Cloud...');
      const { data: marksData, error: mErr } = await client.from('assessment_records').select('*');
      if (!mErr && marksData && marksData.length > 0) {
        const existingIds = new Set(marksData.map((m: any) => m.id));
        const kept = currentState.assessments.filter((m) => !existingIds.has(m.id));
        currentState.assessments = [...marksData, ...kept];
        counts.assessments = marksData.length;
      }

      // 5. Co-Curricular
      onProgress?.('Fetching co-curricular grades from Cloud...');
      const { data: ccData, error: ccErr } = await client.from('co_curricular_grades').select('*');
      if (!ccErr && ccData && ccData.length > 0) {
        const existingIds = new Set(ccData.map((c: any) => c.id));
        const kept = currentState.coCurricular.filter((c) => !existingIds.has(c.id));
        currentState.coCurricular = [...ccData, ...kept];
        counts.coCurricular = ccData.length;
      }

      // 6. Former Students
      onProgress?.('Fetching former students from Cloud...');
      const { data: fsData, error: fsErr } = await client.from('former_students').select('*');
      if (!fsErr && fsData && fsData.length > 0) {
        const existingIds = new Set(fsData.map((f: any) => f.id));
        const kept = currentState.formerStudents.filter((f) => !existingIds.has(f.id));
        currentState.formerStudents = [...fsData, ...kept];
        counts.formerStudents = fsData.length;
      }

      // Persist the merged state back to local IndexedDB
      await erpLocalDB.persistState(currentState);

      this.syncState = 'SYNCED_CLOUD';
      this.lastSyncTime = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_sync_timestamp', this.lastSyncTime);
      }
      this.notify();

      return {
        success: true,
        message: 'Successfully pulled and hydrated cloud records into local database!',
        counts,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to pull from cloud: ${err?.message || 'Check network / schema'}`,
        counts,
      };
    }
  }
}

function getSupabaseTableName(entity: string): string {
  switch (entity) {
    case 'students':
      return 'students';
    case 'marks':
      return 'assessment_records';
    case 'cocurricular':
      return 'co_curricular_grades';
    case 'calendar':
      return 'academic_calendar_events';
    case 'former_students':
      return 'former_students';
    case 'school':
      return 'schools';
    case 'achievements':
      return 'school_achievements';
    case 'faculty':
      return 'users';
    case 'tc':
      return 'transfer_certificates';
    case 'study_cert':
      return 'study_certificates';
    default:
      return entity;
  }
}

function formatForSupabase(tableName: string, data: any): any {
  if (tableName === 'assessment_records') {
    return {
      id: data.id,
      school_id: data.school_id,
      student_id: data.student_id,
      academic_year: data.academic_year,
      class_number: Number(data.class_number),
      section: data.section || 'A',
      subject_name: data.subject_name,
      assessment_type: data.assessment_type || data.assessment_code,
      total_marks: Number(data.total_marks ?? data.marks_obtained ?? 0),
      max_marks: Number(data.max_marks ?? 50),
      grade: data.grade || 'B',
      attendance_count: Number(data.attendance_count || 0),
      updated_by: data.updated_by || data.entered_by || 'Faculty',
      updated_at: data.updated_at || new Date().toISOString(),
    };
  }
  return data;
}

export const syncEngine = new SyncEngine();
