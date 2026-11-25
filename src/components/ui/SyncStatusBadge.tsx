'use client';

import React, { useState } from 'react';
import { Cloud, CloudOff, CheckCircle2, RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useAppState } from '@/lib/context/AppStateContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import SyncDashboardModal from './SyncDashboardModal';

export default function SyncStatusBadge() {
  const { syncStatus } = useAppState();
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusBadge = () => {
    if (!mounted) {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        text: t.sync.savedLocal,
        bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      };
    }

    if (syncStatus.isSimulatedOffline || !syncStatus.isOnline) {
      return {
        icon: <WifiOff className="w-4 h-4 text-amber-500 animate-pulse" />,
        text: t.sync.offlineMode,
        bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700',
      };
    }

    switch (syncStatus.syncState) {
      case 'SAVING':
        return {
          icon: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />,
          text: t.sync.saving,
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
        };
      case 'SYNCED_CLOUD':
        return {
          icon: <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          text: t.sync.syncedCloud,
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
      case 'WAITING_INTERNET':
        return {
          icon: <CloudOff className="w-4 h-4 text-amber-500" />,
          text: t.sync.waitingInternet,
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700',
        };
      case 'SYNC_FAILED':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          text: t.sync.syncFailed,
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
      case 'SAVED_LOCAL':
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          text: t.sync.savedLocal,
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-[1.02] shadow-sm ${badge.bg}`}
        title="Click to open Offline Synchronization Center"
      >
        {badge.icon}
        <span className="hidden sm:inline">{badge.text}</span>
      </button>

      {modalOpen && <SyncDashboardModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
