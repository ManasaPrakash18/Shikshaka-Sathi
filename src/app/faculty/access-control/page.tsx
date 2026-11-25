'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FacultyAccessControlRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/faculty?tab=access');
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-500 text-xs">
      Redirecting to unified Faculty Management...
    </div>
  );
}
