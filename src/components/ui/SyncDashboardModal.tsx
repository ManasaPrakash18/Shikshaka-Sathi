'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  Cloud,
  RefreshCw,
  Database,
  Download,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle,
  Key,
  Globe,
  ArrowUpRight,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { syncEngine } from '@/lib/db/syncEngine';
import { isSupabaseConfigured, getSupabaseConfig } from '@/lib/db/supabaseClient';

export default function SyncDashboardModal({ onClose }: { onClose: () => void }) {
  const {
    state,
    syncStatus,
    triggerManualSync,
    pullCloudData,
    toggleOfflineSimulator,
    downloadBackupJSON,
    restoreBackupJSON,
  } = useAppState();

  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom_supabase_url') || getSupabaseConfig().url || '';
    }
    return '';
  });

  const [supabaseKey, setSupabaseKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom_supabase_anon_key') || getSupabaseConfig().key || '';
    }
    return '';
  });

  const [showConfig, setShowConfig] = useState(false);
  const [isPushingCloud, setIsPushingCloud] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    counts?: Record<string, number>;
  } | null>(null);

  const [isPullingCloud, setIsPullingCloud] = useState(false);
  const [pullStatusMsg, setPullStatusMsg] = useState<string | null>(null);
  const [pullResult, setPullResult] = useState<{
    success: boolean;
    message: string;
    counts?: Record<string, number>;
  } | null>(null);

  const [diagnostic, setDiagnostic] = useState<{
    testing: boolean;
    message: string;
    isError?: boolean;
    errorType?: string;
  } | null>(null);

  const pendingOps = state.syncQueue.filter((op) => op.status === 'PENDING' || op.status === 'FAILED');
  const isCloudReady = isSupabaseConfigured();

  // Auto-run write diagnosis when modal opens to detect connectivity
  useEffect(() => {
    if (isCloudReady) {
      runLiveDiagnostic();
    }
  }, [isCloudReady]);

  const handleSaveCredentials = () => {
    if (typeof window !== 'undefined') {
      if (supabaseUrl) localStorage.setItem('custom_supabase_url', supabaseUrl.trim());
      else localStorage.removeItem('custom_supabase_url');

      if (supabaseKey) localStorage.setItem('custom_supabase_anon_key', supabaseKey.trim());
      else localStorage.removeItem('custom_supabase_anon_key');

      alert(language === 'kn' ? 'ಕ್ಲೌಡ್ ರುಜುವಾತುಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ! ಸಂಪರ್ಕವನ್ನು ಪರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Cloud credentials updated! Running connection check...');
      setShowConfig(false);
      runLiveDiagnostic();
    }
  };

  const runLiveDiagnostic = async () => {
    if (!isCloudReady) {
      setDiagnostic({
        testing: false,
        message: language === 'kn' ? 'ಕ್ಲೌಡ್ URL ಅಥವಾ ಕೀ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ.' : 'Cloud URL or Key is not configured yet. Please configure them below.',
        isError: true,
      });
      return;
    }

    setDiagnostic({ testing: true, message: language === 'kn' ? 'ಕ್ಲೌಡ್ ಓದುವ ಮತ್ತು ಬರೆಯುವ ಅನುಮತಿಗಳನ್ನು ಪರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Testing Cloud read & write permissions...' });
    try {
      const res = await syncEngine.testCloudWritePermission();
      setDiagnostic({
        testing: false,
        message: res.message,
        isError: !res.ok,
        errorType: res.errorType,
      });
    } catch (err: any) {
      setDiagnostic({
        testing: false,
        message: `Connection check notice: ${err?.message || 'Check network / credentials'}`,
        isError: true,
      });
    }
  };

  const handlePushAllToCloud = async () => {
    if (!isCloudReady) {
      setShowConfig(true);
      return;
    }

    setIsPushingCloud(true);
    setPushResult(null);
    setPushStatusMsg(language === 'kn' ? 'ಕ್ಲೌಡ್ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...' : 'Connecting to Cloud...');

    try {
      const res = await syncEngine.pushAllLocalDataToCloud((msg) => {
        setPushStatusMsg(msg);
      });
      setPushResult(res);
      setPushStatusMsg(null);
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err?.message || (language === 'kn' ? 'ಕ್ಲೌಡ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Failed to sync with Cloud'),
      });
      setPushStatusMsg(null);
    } finally {
      setIsPushingCloud(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!isCloudReady) {
      setShowConfig(true);
      return;
    }

    setIsPullingCloud(true);
    setPullResult(null);
    setPullStatusMsg(language === 'kn' ? 'ಕ್ಲೌಡ್‌ನಿಂದ ದಾಖಲೆಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : 'Fetching records from Cloud...');

    try {
      const res = await pullCloudData();
      setPullResult(res);
      setPullStatusMsg(null);
    } catch (err: any) {
      setPullResult({
        success: false,
        message: err?.message || (language === 'kn' ? 'ಕ್ಲೌಡ್‌ನಿಂದ ಡೇಟಾ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Failed to pull data from Cloud'),
      });
      setPullStatusMsg(null);
    } finally {
      setIsPullingCloud(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = await restoreBackupJSON(content);
        if (ok) {
          alert('Backup restored successfully into local browser storage (IndexedDB)!');
          onClose();
        } else {
          alert('Failed to restore backup: Invalid file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center min-h-screen">
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
        {/* Header - Academic Navy */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#0F1D3B] bg-[#16284F] text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Database className="w-5 h-5 text-white/90" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold">{t.sync.dashboardTitle}</h2>
              <p className="text-[11px] sm:text-xs text-blue-100/80">
                {language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಸ್ಥಳೀಯ ಮೆಮೊರಿ ಮತ್ತು ಕ್ಲೌಡ್ ಸಿಂಕ್ ಕೇಂದ್ರ' : 'Offline-first Local Storage & Cloud Sync Hub'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Internet Status */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'kn' ? 'ನೆಟ್‌ವರ್ಕ್' : 'Network'}
                </span>
                {syncStatus.isOnline ? (
                  <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {syncStatus.isOnline ? (language === 'kn' ? 'ಆನ್‌ಲೈನ್' : 'Online') : (language === 'kn' ? 'ಆಫ್‌ಲೈನ್' : 'Offline')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {syncStatus.isSimulatedOffline
                  ? (language === 'kn' ? 'ಅನುಕರಣೀಯ ಆಫ್‌ಲೈನ್ ಮೋಡ್' : 'Simulated Offline Mode')
                  : (language === 'kn' ? 'ಸಾಧನದ ನೆಟ್‌ವರ್ಕ್ ಸಕ್ರಿಯ' : 'Device Network Active')}
              </div>
            </div>

            {/* Sync Engine State */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'kn' ? 'ಸಿಂಕ್ ಸ್ಥಿತಿ' : 'Sync Status'}
                </span>
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus.syncState === 'SYNCED_CLOUD'
                      ? 'bg-blue-500'
                      : syncStatus.syncState === 'SAVING'
                      ? 'bg-blue-500 animate-pulse'
                      : syncStatus.syncState === 'SYNC_FAILED'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                />
                {syncStatus.syncState === 'SYNCED_CLOUD'
                  ? (language === 'kn' ? 'ಕ್ಲೌಡ್‌ನಲ್ಲಿ ಸಂಗ್ರಹವಾಗಿದೆ' : 'Data Stored on Cloud')
                  : syncStatus.syncState === 'SAVING'
                  ? (language === 'kn' ? 'ದಾಖಲೆಗಳನ್ನು ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving Records...')
                  : (language === 'kn' ? 'ಸ್ಥಳೀಯವಾಗಿ ಸಂಗ್ರಹವಾಗಿದೆ' : 'Data Stored Locally')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {language === 'kn' ? 'ಸ್ಥಳೀಯ ಮೆಮೊರಿ ಸಕ್ರಿಯ • ಕ್ಲೌಡ್ ಸಂಪರ್ಕಿತ' : 'Local Storage Active • Cloud Connected'}
              </div>
            </div>

            {/* Cloud Configured */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'kn' ? 'ಕ್ಲೌಡ್ ಡೇಟಾಬೇಸ್' : 'Cloud DB'}
                </span>
                <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                {isCloudReady ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{language === 'kn' ? 'ಕ್ಲೌಡ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ' : 'Cloud Connected'}</span>
                  </>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    {language === 'kn' ? 'ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ' : 'Not Configured'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1 block cursor-pointer"
              >
                {showConfig
                  ? (language === 'kn' ? 'ರುಜುವಾತುಗಳನ್ನು ಮರೆಮಾಡಿ' : 'Hide Credentials')
                  : (language === 'kn' ? 'ರುಜುವಾತುಗಳನ್ನು ಬದಲಿಸಿ' : 'Edit Credentials')}
              </button>
            </div>
          </div>

          {/* Cloud Push & Pull Actions Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {language === 'kn' ? 'ಕ್ಲೌಡ್ ದ್ವಿಮುಖ ಸಿಂಕ್' : 'Cloud Bidirectional Sync'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'kn'
                    ? 'ನಿಮ್ಮ ಆಫ್‌ಲೈನ್ ಶಾಲಾ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ದಾಖಲೆಗಳನ್ನು ಕ್ಲೌಡ್‌ಗೆ ಕಳುಹಿಸಿ ಅಥವಾ ಕ್ಲೌಡ್‌ನಿಂದ ಸ್ಥಳೀಯ ಮೆಮೊರಿಗೆ ಪಡೆಯಿರಿ.'
                    : 'Push your offline school and student records to Cloud, or hydrate local storage from Cloud.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={handlePushAllToCloud}
                disabled={isPushingCloud || isPullingCloud}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16284F] hover:bg-[#0F1D3B] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className={`w-4 h-4 ${isPushingCloud ? 'animate-bounce' : ''}`} />
                {isPushingCloud
                  ? (language === 'kn' ? 'ಕ್ಲೌಡ್‌ಗೆ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Pushing to Cloud...')
                  : (language === 'kn' ? 'ಸ್ಥಳೀಯ ಡೇಟಾವನ್ನು ಕ್ಲೌಡ್‌ಗೆ ಕಳುಹಿಸಿ' : 'Push All Local Data to Cloud')}
              </button>

              <button
                onClick={handlePullFromCloud}
                disabled={isPushingCloud || isPullingCloud}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isPullingCloud ? 'animate-bounce' : ''}`} />
                {isPullingCloud
                  ? (language === 'kn' ? 'ಕ್ಲೌಡ್‌ನಿಂದ ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : 'Pulling from Cloud...')
                  : (language === 'kn' ? 'ಕ್ಲೌಡ್ ಡೇಟಾವನ್ನು ಸ್ಥಳೀಯ ಮೆಮೊರಿಗೆ ಪಡೆಯಿರಿ' : 'Pull Cloud Data to Local DB')}
              </button>
            </div>

            {/* In-progress status message */}
            {(pushStatusMsg || pullStatusMsg) && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>{pushStatusMsg || pullStatusMsg}</span>
              </div>
            )}

            {/* Results feedback banner */}
            {pushResult && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  pushResult.success
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {pushResult.success ? (
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{pushResult.message}</span>
                </div>
                {pushResult.counts && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                    {Object.entries(pushResult.counts).map(([k, v]) => (
                      <span key={k} className="capitalize">
                        {k}: <strong>{v}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {pullResult && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  pullResult.success
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {pullResult.success ? (
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{pullResult.message}</span>
                </div>
                {pullResult.counts && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                    {Object.entries(pullResult.counts).map(([k, v]) => (
                      <span key={k} className="capitalize">
                        {k}: <strong>{v}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real-time Diagnostics Bar */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                {language === 'kn' ? 'ಕ್ಲೌಡ್ ಸಂಪರ್ಕ ಮತ್ತು ಪರಿಶೀಲನೆ' : 'Cloud Connectivity & Verification'}
              </span>
              <button
                onClick={runLiveDiagnostic}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3 h-3 ${diagnostic?.testing ? 'animate-spin' : ''}`} />
                {language === 'kn' ? 'ಸಂಪರ್ಕ ಪರೀಕ್ಷಿಸಿ' : 'Test Live Connection'}
              </button>
            </div>
            {diagnostic && (
              <div
                className={`p-2.5 rounded-lg text-[11px] font-medium border flex items-center gap-2 ${
                  diagnostic.isError
                    ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-200'
                    : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
                }`}
              >
                {diagnostic.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
                )}
                <span>{diagnostic.message}</span>
              </div>
            )}
          </div>

          {/* Cloud Custom Credentials Form */}
          {showConfig && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Key className="w-4 h-4 text-blue-600" />
                {language === 'kn' ? 'ಕ್ಲೌಡ್ ವಿವರಗಳು' : 'Custom Cloud Credentials'}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">
                    {language === 'kn' ? 'ಪ್ರಾಜೆಕ್ಟ್ URL' : 'Project URL'}
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.cloud-api.co"
                    className="w-full text-xs font-mono p-2 mt-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">
                    {language === 'kn' ? 'ಸಾರ್ವಜನಿಕ API ಕೀ' : 'Anon / Public API Key'}
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full text-xs font-mono p-2 mt-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveCredentials}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  {language === 'kn' ? 'ಉಳಿಸಿ ಮತ್ತು ಸಂಪರ್ಕಿಸಿ' : 'Save & Connect'}
                </button>
              </div>
            </div>
          )}

          {/* Sync Queue Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'kn'
                  ? `ಬಾಕಿ ಉಳಿದ ಸ್ಥಳೀಯ ಸಿಂಕ್ ಕ್ಯೂ (${pendingOps.length})`
                  : `Pending Local Sync Queue (${pendingOps.length})`}
              </span>
              <button
                onClick={triggerManualSync}
                disabled={pendingOps.length === 0}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {language === 'kn' ? 'ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ' : 'Flush Queue Now'}
              </button>
            </div>

            {pendingOps.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                {language === 'kn'
                  ? 'ಎಲ್ಲಾ ಸ್ಥಳೀಯ ವಿವರಗಳು ಕ್ಲೌಡ್‌ನೊಂದಿಗೆ ಸಿಂಕ್ ಆಗಿವೆ.'
                  : 'All local actions are synced with the cloud.'}
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {pendingOps.map((op) => (
                  <div key={op.op_id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {op.operation_type}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {op.entity_type} ({op.record_id})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(op.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Backup & Restore Section */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'kn' ? 'ಸ್ಥಳೀಯ ಡೇಟಾಬೇಸ್ ಬ್ಯಾಕಪ್ ಮತ್ತು ಮರುಸ್ಥಾಪನೆ' : 'Local Database Backup & Restore'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'kn'
                    ? 'ಆಫ್‌ಲೈನ್ ಬ್ಯಾಕಪ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಹಿಂದಿನ JSON ಬ್ಯಾಕಪ್ ಅನ್ನು ಮರುಸ್ಥಾಪಿಸಿ.'
                    : 'Export offline snapshot or restore previously exported JSON backup into IndexedDB.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadBackupJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  {language === 'kn' ? 'ಬ್ಯಾಕಪ್ ರಫ್ತು' : 'Export JSON Backup'}
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  {language === 'kn' ? 'ಬ್ಯಾಕಪ್ ಮರುಸ್ಥಾಪಿಸಿ' : 'Restore Database Backup'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-2 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
