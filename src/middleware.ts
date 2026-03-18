import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que requerem autenticação
const PRIVATE_PATH_PREFIX = "/dashboard";

// Rotas de autenticação (se já logado, redireciona para dashboard)
const AUTH_PATHS = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Encontra o cookie de sessão do Supabase
  const hasSession = request.cookies.getAll().some(
    (cookie) =>
      cookie.name.startsWith("sb-") &&
      cookie.name.endsWith("-auth-token") &&
      cookie.value.length > 0
  );

  const isPrivatePath = pathname.startsWith(PRIVATE_PATH_PREFIX);
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Rota privada sem sessão → redireciona para login
  if (isPrivatePath && !hasSession) {
    console.log(`[Middleware] Bloqueado: ${pathname} -> Redirecionando para /login`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rota de auth com sessão ativa → redireciona para dashboard
  if (isAuthPath && hasSession) {
    console.log(`[Middleware] Já logado: ${pathname} -> Redirecionando para /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets like fonts/images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)",
  ],
};
