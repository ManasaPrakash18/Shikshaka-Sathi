import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const sanitizeSupabaseUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/[<>]/g, '');
};

export const getSupabaseConfig = () => {
  let url = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
  let key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('custom_supabase_url');
    const customKey = localStorage.getItem('custom_supabase_anon_key');
    if (customUrl) url = sanitizeSupabaseUrl(customUrl);
    if (customKey) key = customKey.trim();
  }
  return { url, key };
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return false;
  if (url.includes('mock-') || url.includes('your-project')) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient {
  const { url, key } = getSupabaseConfig();

  if (isSupabaseConfigured()) {
    if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
      return cachedClient;
    }
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      lastUsedUrl = url;
      lastUsedKey = key;
      return cachedClient;
    } catch (err) {
      console.warn('Could not initialize Supabase client with provided URL, using fallback:', err);
    }
  }

  if (!cachedClient) {
    cachedClient = createClient(
      'https://mock-karnataka-cce.supabase.co',
      'mock-anon-key-karnataka-education-system',
      { auth: { persistSession: true } }
    );
  }
  return cachedClient;
}

export const supabase = getSupabaseClient();

// Authentication Helpers
export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        user: { id: 'offline-user', email, user_metadata: {} } as any,
        session: null as any,
      },
      error: null,
    };
  }
  return await getSupabaseClient().auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, any>) {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        user: { id: 'offline-user', email, user_metadata: metadata } as any,
        session: null as any,
      },
      error: null,
    };
  }
  return await getSupabaseClient().auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
}

export async function signOutUser() {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  return await getSupabaseClient().auth.signOut();
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session;
}

export async function getAuthUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { data } = await getSupabaseClient().auth.getUser();
  return data.user;
}

export async function resetPasswordForEmail(email: string) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }
  return await getSupabaseClient().auth.resetPasswordForEmail(email);
}

export function onAuthStateChange(callback: (event: any, session: any) => void) {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return getSupabaseClient().auth.onAuthStateChange(callback);
}
