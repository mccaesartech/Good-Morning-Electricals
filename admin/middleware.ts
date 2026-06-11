import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC_PATHS = ['/login', '/auth/callback'];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/programmes',
  '/staff',
  '/gallery',
  '/testimonials',
  '/faq',
  '/facilities',
  '/hero',
  '/settings',
  '/contact',
  '/activity'
];

function isPublic(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

function isProtected(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (isProtected(path)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase.rpc('get_admin_profile');
    if (!profile) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  if (isPublic(path) && path.startsWith('/login') && user) {
    const { data: profile } = await supabase.rpc('get_admin_profile');
    if (profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/programmes/:path*',
    '/staff/:path*',
    '/gallery/:path*',
    '/testimonials/:path*',
    '/faq/:path*',
    '/facilities/:path*',
    '/hero/:path*',
    '/settings/:path*',
    '/contact/:path*',
    '/activity/:path*',
    '/login',
    '/login/:path*'
  ]
};
