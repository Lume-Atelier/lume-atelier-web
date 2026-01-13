import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { decodeJWT, isTokenExpired, extractRole } from "./lib/jwt";

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/library", "/checkout"];

  // Rotas que requerem role ADMIN
  const adminRoutes = ["/admin"];

  // Verifica se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route),
  );

  const isAdminRoute = adminRoutes.some((route) => pathname.includes(route));

  if (isProtectedRoute || isAdminRoute) {
    // Verifica se há token de autenticação
    const token = request.cookies.get("auth_token")?.value;
    const locale = pathname.split("/")[1] || "pt-BR";

    if (!token) {
      // Redireciona para login se não estiver autenticado
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // CRÍTICO: Verifica se o token está expirado ANTES de renderizar
    if (isTokenExpired(token)) {
      console.log('Token expired - automatic logout');

      // Cria resposta de redirecionamento para login
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);

      // IMPORTANTE: Remove o cookie expirado
      response.cookies.set("auth_token", "", {
        path: "/",
        expires: new Date(0), // Data passada para deletar o cookie
      });

      return response;
    }

    // Se é rota admin, verifica a role
    if (isAdminRoute) {
      const userRole = extractRole(token);

      if (userRole !== "ADMIN") {
        // Redireciona para home se não for admin
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }
    }
  }

  // Aplica o middleware de internacionalização
  return intlMiddleware(request);
}

export const config = {
  // Matcher ignorando rotas internas do Next.js e arquivos estáticos
  matcher: [
    "/",
    "/(pt-BR|en-US|es-ES|fr-FR|de-DE)/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
