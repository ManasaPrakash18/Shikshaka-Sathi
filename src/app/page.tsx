'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import DashboardPage from './dashboard/page';
import PlatformAdminPage from './platform-admin/page';

export default function HomePage() {
  const { userRole } = useAuth();

  if (userRole === 'PLATFORM_ADMIN') {
    return <PlatformAdminPage />;
  }

  return <DashboardPage />;
}
