'use client';

import { Header } from '@/components/features/layout/Header';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
