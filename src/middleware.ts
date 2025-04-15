import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/server/auth/session.auth';

const protectedRoutes = ['/admin/dashboard'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);

  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  const isAuthenticated = session?.username;

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
  }

  if (path === '/admin/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
