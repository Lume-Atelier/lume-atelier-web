'use client';

import { Header } from '@/components/features/layout/Header';
import { TokenRefreshProvider } from '@/components/auth/TokenRefreshProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TokenRefreshProvider>
      <Header />
      {children}
    </TokenRefreshProvider>
  );
}
