import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ClientLayout } from '@/components/ClientLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Providers } from './providers';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lume Atelier - Premium 3D Assets',
  description: 'Global marketplace for high-quality 3D assets',
  keywords: ['3D assets', '3D models', 'Blender', 'Maya', '3ds Max', 'Cinema 4D'],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Valida se o locale é suportado
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Carrega as mensagens de tradução
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            <NextIntlClientProvider messages={messages}>
              <ClientLayout>
                {children}
              </ClientLayout>
            </NextIntlClientProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
