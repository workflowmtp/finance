import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (pas besoin d'authentification)
const publicRoutes = ['/login', '/register', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Vérifier si c'est un fichier statique
  const isStaticFile = pathname.includes('.') || pathname.startsWith('/_next');

  if (isPublicRoute || isStaticFile) {
    return NextResponse.next();
  }

  // Vérifier le token de session (cookie next-auth)
  const sessionToken = request.cookies.get('next-auth.session-token')?.value 
    || request.cookies.get('__Secure-next-auth.session-token')?.value;

  // Si pas de session, rediriger vers login
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
