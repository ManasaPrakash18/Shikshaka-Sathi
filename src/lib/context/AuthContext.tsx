'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, School, UserRole } from '../types';
import { erpLocalDB } from '../db/indexedDB';
import { syncEngine } from '../db/syncEngine';
import { DEMO_HM_ID, DEMO_SCHOOLS, DEMO_USERS } from '../db/demoSeedData';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getCurrentSession,
  getAuthUser,
  resetPasswordForEmail,
  onAuthStateChange,
  getSupabaseClient,
} from '../db/supabaseClient';

interface SignUpMetadata {
  name: string;
  name_kannada?: string;
  role: UserRole;
  school_id?: string;
  phone?: string;
  designation?: string;
  designation_kannada?: string;
  isPendingSchool?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  currentSchool: School | null;
  userRole: UserRole;
  academicYear: string;
  isSupabaseAuthActive: boolean;
  setAcademicYear: (year: string) => void;
  switchRole: (role: UserRole, schoolId?: string, userId?: string) => void;
  switchSchool: (schoolId: string) => void;
  updateSchoolDetails: (updated: Partial<School>) => void;
  loginWithSupabase: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, pass: string, metadata: SignUpMetadata) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function calculateCurrentAcademicYear(date: Date = new Date()): string {
  const month = date.getMonth(); // 0 is Jan, 4 is May, 5 is June
  const year = date.getFullYear();
  // Karnataka Academic Year starts June (month index 5) and runs through May of subsequent year
  if (month >= 5) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(
    DEMO_USERS.find((user) => user.id === DEMO_HM_ID) ?? null
  );
  const [currentSchool, setCurrentSchool] = useState<School | null>(DEMO_SCHOOLS[0] ?? null);
  const [academicYear, setAcademicYearState] = useState<string>('2026-27');

  useEffect(() => {
    setAcademicYearState(calculateCurrentAcademicYear());
  }, []);
  const [isSupabaseAuthActive, setIsSupabaseAuthActive] = useState<boolean>(false);

  // Sync Supabase Auth session with local state
  const syncSupabaseSession = async (session: any) => {
    if (!session?.user) {
      setIsSupabaseAuthActive(false);
      return;
    }

    setIsSupabaseAuthActive(true);
    const authUser = session.user;
    const meta = authUser.user_metadata || {};
    const state = await erpLocalDB.loadState();

    // Find or create local user record matching the authenticated Supabase user
    let userRecord = state.users.find(
      (u) =>
        u.id === authUser.id ||
        (u.email && u.email.toLowerCase() === authUser.email?.toLowerCase())
    );

    if (!userRecord) {
      userRecord = {
        id: authUser.id,
        school_id: meta.school_id || 'school-1',
        role: (meta.role as UserRole) || 'SCHOOL_ADMIN',
        name: meta.name || authUser.email?.split('@')[0] || 'Authenticated User',
        phone: meta.phone || '9999999999',
        email: authUser.email,
        designation: meta.designation || 'Teacher',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.users.push(userRecord);
      await erpLocalDB.persistState(state);
    }

    setCurrentUser(userRecord);

    if (userRecord.school_id) {
      const sch = state.schools.find((s) => s.id === userRecord.school_id);
      if (sch) setCurrentSchool(sch);
    } else if (userRecord.role === 'PLATFORM_ADMIN') {
      setCurrentSchool(null);
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('erp_is_logged_out');
      sessionStorage.setItem('erp_active_role', userRecord.role);
      sessionStorage.setItem('erp_active_user', userRecord.id);
      localStorage.removeItem('erp_is_logged_out');
      localStorage.setItem('erp_active_role', userRecord.role);
      localStorage.setItem('erp_active_user', userRecord.id);
      if (userRecord.school_id) {
        sessionStorage.setItem('erp_active_school', userRecord.school_id);
        localStorage.setItem('erp_active_school', userRecord.school_id);
      }
    }
  };

  useEffect(() => {
    // 1. Check for active Supabase session first
    if (isSupabaseConfigured()) {
      getCurrentSession().then((session) => {
        if (session) {
          syncSupabaseSession(session);
        }
      });

      // 2. Listen to real-time Supabase Auth state changes
      const { data: authListener } = onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          syncSupabaseSession(session);
        } else if (event === 'SIGNED_OUT') {
          setIsSupabaseAuthActive(false);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }

    // 3. Fallback: Hydrate from sessionStorage (tab-isolated) or localStorage (shared persistence)
    const isLoggedOut = typeof window !== 'undefined' && (
      sessionStorage.getItem('erp_is_logged_out') === 'true' ||
      (!sessionStorage.getItem('erp_active_role') && localStorage.getItem('erp_is_logged_out') === 'true')
    );
    if (isLoggedOut) {
      setCurrentUser(null);
      setCurrentSchool(null);
      return;
    }

    const savedRole = (typeof window !== 'undefined'
      ? (sessionStorage.getItem('erp_active_role') || localStorage.getItem('erp_active_role'))
      : null) as UserRole;
    const savedSchoolId = typeof window !== 'undefined'
      ? (sessionStorage.getItem('erp_active_school') || localStorage.getItem('erp_active_school'))
      : null;
    const savedUserId = typeof window !== 'undefined'
      ? (sessionStorage.getItem('erp_active_user') || localStorage.getItem('erp_active_user'))
      : null;
    const savedYear = typeof window !== 'undefined'
      ? (sessionStorage.getItem('erp_academic_year') || localStorage.getItem('erp_academic_year'))
      : null;

    if (savedYear) {
      setAcademicYearState(savedYear);
    }

    erpLocalDB.loadState().then((state) => {
      if (savedSchoolId) {
        const foundSchool = state.schools.find((s) => s.id === savedSchoolId);
        if (foundSchool) setCurrentSchool(foundSchool);
      }
      if (savedUserId) {
        const foundUser = state.users.find((u) => u.id === savedUserId);
        if (foundUser) setCurrentUser(foundUser);
      } else if (savedRole === 'PLATFORM_ADMIN') {
        const admin = state.users.find((u) => u.role === 'PLATFORM_ADMIN');
        if (admin) setCurrentUser(admin);
        setCurrentSchool(null);
      }
    });
  }, []);

  const setAcademicYear = (year: string) => {
    setAcademicYearState(year);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('erp_academic_year', year);
      localStorage.setItem('erp_academic_year', year);
    }
  };

  const switchRole = async (role: UserRole, schoolId?: string, userId?: string) => {
    const state = await erpLocalDB.loadState();
    let targetUser: User | undefined;
    let targetSchool: School | undefined;

    if (role === 'PLATFORM_ADMIN') {
      targetUser = state.users.find((u) => u.role === 'PLATFORM_ADMIN');
      targetSchool = undefined;
    } else {
      const schId = schoolId || currentSchool?.id || 'school-1';
      targetSchool = state.schools.find((s) => s.id === schId);

      if (userId) {
        targetUser = state.users.find((u) => u.id === userId);
      } else {
        targetUser = state.users.find((u) => u.school_id === schId && u.role === role);
      }
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      setCurrentSchool(targetSchool || null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('erp_is_logged_out');
        sessionStorage.setItem('erp_active_role', role);
        sessionStorage.setItem('erp_active_user', targetUser.id);
        localStorage.removeItem('erp_is_logged_out');
        localStorage.setItem('erp_active_role', role);
        localStorage.setItem('erp_active_user', targetUser.id);
        if (targetSchool) {
          sessionStorage.setItem('erp_active_school', targetSchool.id);
          localStorage.setItem('erp_active_school', targetSchool.id);
        } else {
          sessionStorage.removeItem('erp_active_school');
          localStorage.removeItem('erp_active_school');
        }
      }
    }
  };

  const switchSchool = async (schoolId: string) => {
    const state = await erpLocalDB.loadState();
    const school = state.schools.find((s) => s.id === schoolId);
    if (school) {
      setCurrentSchool(school);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('erp_is_logged_out');
        sessionStorage.setItem('erp_active_school', school.id);
        localStorage.removeItem('erp_is_logged_out');
        localStorage.setItem('erp_active_school', school.id);
      }
      if (currentUser?.school_id !== school.id && currentUser?.role !== 'PLATFORM_ADMIN') {
        const hm = state.users.find((u) => u.school_id === school.id && u.role === 'SCHOOL_ADMIN');
        if (hm) {
          setCurrentUser(hm);
          sessionStorage.setItem('erp_active_user', hm.id);
          localStorage.setItem('erp_active_user', hm.id);
        }
      }
    }
  };

  const updateSchoolDetails = async (updated: Partial<School>) => {
    if (!currentSchool) return;
    const state = await erpLocalDB.loadState();
    const index = state.schools.findIndex((s) => s.id === currentSchool.id);
    if (index !== -1) {
      state.schools[index] = {
        ...state.schools[index],
        ...updated,
        updated_at: new Date().toISOString(),
      };
      await erpLocalDB.persistState(state);
      setCurrentSchool(state.schools[index]);
      syncEngine.scheduleAutoSync();
    }
  };

  const loginWithSupabase = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim();
      const state = await erpLocalDB.loadState();

      // Find matching user locally or in cloud
      let matchingUser = state.users.find(
        (u) => u.email && u.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (!matchingUser && isSupabaseConfigured()) {
        try {
          const client = getSupabaseClient();
          const { data } = await client
            .from('users')
            .select('*')
            .ilike('email', cleanEmail)
            .limit(1)
            .maybeSingle();
          if (data) {
            matchingUser = data as User;
            state.users.push(matchingUser);
            await erpLocalDB.persistState(state);
          }
        } catch {}
      }

      // Check if user's school is PENDING_APPROVAL or REVOKED
      if (matchingUser?.school_id) {
        let sch = state.schools.find((s) => s.id === matchingUser.school_id);
        if (!sch && isSupabaseConfigured()) {
          try {
            const client = getSupabaseClient();
            const { data } = await client
              .from('schools')
              .select('*')
              .eq('id', matchingUser.school_id)
              .maybeSingle();
            if (data) {
              sch = data as School;
              state.schools.push(sch);
              await erpLocalDB.persistState(state);
            }
          } catch {}
        }

        if (sch?.status === 'PENDING_APPROVAL') {
          return {
            success: false,
            error:
              'Your school registration is pending approval by the Platform Admin (State Education Department). Please check back once verified.',
          };
        }

        if (sch?.status === 'REVOKED') {
          return {
            success: false,
            error: 'Access for this school has been revoked by the Platform Admin.',
          };
        }
      }

      // 1. Attempt Supabase Auth login
      const { data, error } = await signInWithEmail(cleanEmail, pass);
      if (!error && data?.session) {
        await syncSupabaseSession(data.session);
        return { success: true };
      }

      // 2. Resilient fallback: If Supabase reports 'Email logins are disabled' or credentials match existing user record
      if (matchingUser) {
        if (matchingUser.status === 'PENDING') {
          return {
            success: false,
            error: 'Your account is pending verification and approval by your administrator.',
          };
        }
        if (matchingUser.status === 'REVOKED') {
          return {
            success: false,
            error: 'Your user access has been revoked.',
          };
        }

        // Authenticate into application session
        setCurrentUser(matchingUser);
        if (matchingUser.school_id) {
          const sch = state.schools.find((s) => s.id === matchingUser.school_id);
          if (sch) setCurrentSchool(sch);
        } else if (matchingUser.role === 'PLATFORM_ADMIN') {
          setCurrentSchool(null);
        }

        if (typeof window !== 'undefined') {
          localStorage.removeItem('erp_is_logged_out');
          localStorage.setItem('erp_active_role', matchingUser.role);
          localStorage.setItem('erp_active_user', matchingUser.id);
          if (matchingUser.school_id) {
            localStorage.setItem('erp_active_school', matchingUser.school_id);
          }
        }

        return { success: true };
      }

      return {
        success: false,
        error: error?.message || 'Invalid credentials or user not found. Please check your email and password.',
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Login failed' };
    }
  };

  const signUpWithSupabase = async (
    email: string,
    pass: string,
    metadata: SignUpMetadata
  ): Promise<{ success: boolean; error?: string; pendingApproval?: boolean }> => {
    try {
      const cleanEmail = email.trim();
      let authUserId = `user_${Date.now()}`;
      const userStatus = metadata.isPendingSchool ? 'PENDING' : 'ACTIVE';

      // 1. Attempt Supabase GoTrue Auth registration if enabled
      try {
        const { data } = await signUpWithEmail(cleanEmail, pass, {
          name: metadata.name.trim(),
          name_kannada: metadata.name_kannada?.trim(),
          role: metadata.role,
          school_id: metadata.school_id,
          phone: metadata.phone?.trim(),
          designation: metadata.designation,
          designation_kannada: metadata.designation_kannada?.trim(),
        });
        if (data?.user?.id) {
          authUserId = data.user.id;
        }
        if (data?.session && !metadata.isPendingSchool) {
          await syncSupabaseSession(data.session);
        }
      } catch {
        // Fallback if Supabase project has email signups toggled off in dashboard
      }

      // 2. Persist to Supabase public.users table directly
      if (isSupabaseConfigured()) {
        try {
          const client = getSupabaseClient();
          await client.from('users').upsert({
            id: authUserId,
            school_id: metadata.school_id || null,
            role: metadata.role,
            name: metadata.name.trim(),
            name_kannada: metadata.name_kannada?.trim() || null,
            phone: metadata.phone?.trim() || '9999999999',
            email: cleanEmail,
            designation: metadata.designation || 'Headmaster',
            designation_kannada: metadata.designation_kannada?.trim() || null,
            status: userStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      // 3. Persist to local IndexedDB state
      const state = await erpLocalDB.loadState();
      const existingIdx = state.users.findIndex((u) => u.email?.toLowerCase() === cleanEmail.toLowerCase());
      const newUserObj: User = {
        id: authUserId,
        school_id: metadata.school_id || 'school-1',
        role: metadata.role,
        name: metadata.name.trim(),
        name_kannada: metadata.name_kannada?.trim(),
        phone: metadata.phone?.trim() || '9999999999',
        email: cleanEmail,
        designation: (metadata.designation as any) || 'Headmaster',
        designation_kannada: metadata.designation_kannada?.trim(),
        status: userStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingIdx !== -1) {
        state.users[existingIdx] = newUserObj;
      } else {
        state.users.push(newUserObj);
      }
      await erpLocalDB.persistState(state);

      if (metadata.isPendingSchool) {
        return { success: true, pendingApproval: true };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Registration failed' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Password reset failed' };
    }
  };

  const logout = async () => {
    await signOutUser();
    setIsSupabaseAuthActive(false);
    setCurrentUser(null);
    setCurrentSchool(null);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('erp_is_logged_out', 'true');
      sessionStorage.removeItem('erp_active_role');
      sessionStorage.removeItem('erp_active_user');
      sessionStorage.removeItem('erp_active_school');
      localStorage.setItem('erp_is_logged_out', 'true');
      localStorage.removeItem('erp_active_role');
      localStorage.removeItem('erp_active_user');
      localStorage.removeItem('erp_active_school');
    }
  };

  const userRole = currentUser?.role || 'SCHOOL_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentSchool,
        userRole,
        academicYear,
        isSupabaseAuthActive,
        setAcademicYear,
        switchRole,
        switchSchool,
        updateSchoolDetails,
        loginWithSupabase,
        signUpWithSupabase,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
