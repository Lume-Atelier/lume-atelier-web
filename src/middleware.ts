import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Decodifica o payload do JWT sem verificar a assinatura
 * (apenas para verificação de role no middleware)
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ['/library', '/checkout'];

  // Rotas que requerem role ADMIN
  const adminRoutes = ['/admin'];

  // Verifica se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.includes(route)
  );

  const isAdminRoute = adminRoutes.some(route =>
    pathname.includes(route)
  );

  if (isProtectedRoute || isAdminRoute) {
    // Verifica se há token de autenticação
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Redireciona para login se não estiver autenticado
      const locale = pathname.split('/')[1] || 'pt-BR';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Se é rota admin, verifica a role
    if (isAdminRoute) {
      const payload = decodeJWT(token);

      // Busca a role no payload do JWT
      // O backend pode armazenar a role de diferentes formas
      const userRole = payload?.role || payload?.authorities?.[0] || payload?.scope;

      if (userRole !== 'ADMIN') {
        // Redireciona para home se não for admin
        const locale = pathname.split('/')[1] || 'pt-BR';
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }
    }
  }

  // Aplica o middleware de internacionalização
  return intlMiddleware(request);
}

export const config = {
  // Matcher ignorando rotas internas do Next.js e arquivos estáticos
  matcher: ['/', '/(pt-BR|en-US|es-ES|fr-FR|de-DE)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
