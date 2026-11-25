import type { Metadata } from 'next';
import './globals.css';
import MainShell from '@/components/layout/MainShell';

export const metadata: Metadata = {
  title: 'Shikshaka Sathi — Unified School Intelligence & CCE Management Platform',
  description:
    'Comprehensive multi-tenant CCE evaluation, marks management, and administrative platform with offline-first synchronization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#EAF0F6] dark:bg-[#111A24] text-[#243449] dark:text-[#F1F5F9] antialiased selection:bg-[#16284F] selection:text-white">
        <MainShell>{children}</MainShell>
      </body>
    </html>
  );
}
