import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/server/auth/session.auth';

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdminRoute = path === '/admin' || path.startsWith('/admin/');
  const isAdminLoginRoute = path === '/admin/login';

  // Default to not authenticated if any errors occur
  let isAuthenticated = false;

  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    isAuthenticated = !!session?.username;
  } catch (error) {
    console.error('Authentication error in middleware:', error);
    isAuthenticated = false;
  }

  if (path === '/admin') {
    return NextResponse.redirect(new URL(isAuthenticated ? '/admin/dashboard' : '/admin/login', req.nextUrl));
  }

  if (isAdminRoute && !isAdminLoginRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
  }

  if (isAdminLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
