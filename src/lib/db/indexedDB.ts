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
  StudyCertificate,
  FormerStudent,
  StudentAuditLog,
  StudentPromotionRecord,
  SyncOperation,
} from '../types';
import {
  DEMO_ACHIEVEMENTS,
  DEMO_ASSESSMENTS,
  DEMO_CALENDAR_EVENTS,
  DEMO_CO_CURRICULAR,
  DEMO_CONSTRUCTION_WORKS,
  DEMO_FACULTY_ASSIGNMENTS,
  DEMO_GALLERY,
  DEMO_SDMC_MEETINGS,
  DEMO_SCHOOLS,
  DEMO_STUDENTS,
  DEMO_USERS,
} from './demoSeedData';

const DB_NAME = 'Karnataka_CCE_ERP_DB';
const DB_VERSION = 2;

export interface ERPStorageState {
  schools: School[];
  users: User[];
  facultyAssignments: FacultyAssignment[];
  students: Student[];
  studentAuditLogs: StudentAuditLog[];
  studentPromotions: StudentPromotionRecord[];
  assessments: AssessmentRecord[];
  coCurricular: CoCurricularGradeRecord[];
  calendarEvents: AcademicCalendarEvent[];
  achievements: SchoolAchievement[];
  constructionWorks: ConstructionWork[];
  sdmcMeetings: SDMCMeeting[];
  gallery: SchoolGalleryItem[];
  transferCertificates: TransferCertificate[];
  studyCertificates: StudyCertificate[];
  formerStudents: FormerStudent[];
  syncQueue: SyncOperation[];
}

const LOCAL_STORAGE_KEY = 'karnataka_cce_erp_store_v2';

export function getInitialState(): ERPStorageState {
  return {
    schools: [...DEMO_SCHOOLS],
    users: [...DEMO_USERS],
    facultyAssignments: [...DEMO_FACULTY_ASSIGNMENTS],
    students: [...DEMO_STUDENTS],
    studentAuditLogs: [],
    studentPromotions: [],
    assessments: [...DEMO_ASSESSMENTS],
    coCurricular: [...DEMO_CO_CURRICULAR],
    calendarEvents: [...DEMO_CALENDAR_EVENTS],
    achievements: [...DEMO_ACHIEVEMENTS],
    constructionWorks: [...DEMO_CONSTRUCTION_WORKS],
    sdmcMeetings: [...DEMO_SDMC_MEETINGS],
    gallery: [...DEMO_GALLERY],
    transferCertificates: [],
    studyCertificates: [],
    formerStudents: [],
    syncQueue: [],
  };
}

class ERPLocalDB {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private state: ERPStorageState | null = null;
  private listeners: ((state: ERPStorageState) => void)[] = [];
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('vidyalaya_db_sync_channel');
          this.broadcastChannel.onmessage = async (event) => {
            if (event.data?.type === 'STATE_UPDATED') {
              // Pass the payload directly if present, or reload
              if (event.data?.state) {
                this.state = event.data.state;
                this.notifyListeners(this.state!);
              } else {
                this.state = null;
                const fresh = await this.loadState();
                this.notifyListeners(fresh);
              }
            }
          };
        } catch {
          // BroadcastChannel unsupported or blocked
        }
      }

      // Universal cross-tab fallback for all OSs and browsers
      window.addEventListener('storage', async (event) => {
        if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
          try {
            const fresh = JSON.parse(event.newValue);
            this.state = fresh;
            this.notifyListeners(fresh);
          } catch {
            this.state = null;
            const fresh = await this.loadState();
            this.notifyListeners(fresh);
          }
        }
      });
    }
  }

  private initDB(): Promise<IDBDatabase | null> {
    if (!this.dbPromise && typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);
          request.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('app_data')) {
              db.createObjectStore('app_data', { keyPath: 'key' });
            }
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => {
            console.warn('IndexedDB open error, falling back to localStorage');
            resolve(null);
          };
        } catch {
          resolve(null);
        }
      });
    }
    return this.dbPromise || Promise.resolve(null);
  }

  public async loadState(): Promise<ERPStorageState> {
    if (this.state) return this.state;

    if (typeof window === 'undefined') {
      return getInitialState();
    }

    try {
      const db = await this.initDB();
      if (db) {
        const idbState = await new Promise<ERPStorageState | null>((resolve) => {
          try {
            const tx = db.transaction('app_data', 'readonly');
            const store = tx.objectStore('app_data');
            const req = store.get('root_state');
            req.onsuccess = () => resolve(req.result ? req.result.data : null);
            req.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        });

        if (idbState) {
          this.state = idbState;
          await this.persistState(this.state);
          return this.state;
        }
      }

      // Check localStorage fallback
      const ls = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (ls) {
        const parsed = JSON.parse(ls);
        this.state = parsed;
        await this.persistState(parsed);
        return this.state!;
      }
    } catch (err) {
      console.warn('Error reading local storage:', err);
    }

    // Default seed
    this.state = getInitialState();
    await this.persistState(this.state);
    return this.state;
  }

  public async persistState(newState: ERPStorageState, broadcast = true): Promise<void> {
    this.state = newState;
    if (typeof window === 'undefined') return;

    // Dual persistence: IndexedDB + localStorage backup
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // ignore storage quota errors for localStorage
    }

    try {
      const db = await this.initDB();
      if (db) {
        const tx = db.transaction('app_data', 'readwrite');
        const store = tx.objectStore('app_data');
        store.put({ key: 'root_state', data: newState });
      }
    } catch (err) {
      console.warn('IndexedDB write error:', err);
    }

    if (broadcast) {
      try {
        this.broadcastChannel?.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now(), state: newState });
      } catch {
        // Broadcast failed
      }
      this.notifyListeners(newState);
    }
  }

  public subscribe(cb: (state: ERPStorageState) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners(state: ERPStorageState) {
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  public async clearAll(): Promise<void> {
    this.state = getInitialState();
    await this.persistState(this.state);
  }
}

export const erpLocalDB = new ERPLocalDB();
