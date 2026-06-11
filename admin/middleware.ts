import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { ROUTE_PERMISSIONS, hasPermission, type Permission } from '@/lib/permissions';

const PUBLIC_PATHS = ['/login', '/auth/callback'];

const PROTECTED_PREFIXES = [
  '/dashboard', '/programmes', '/staff', '/gallery', '/testimonials', '/faq',
  '/facilities', '/hero', '/settings', '/contact', '/activity',
  '/enquiries', '/enrolments', '/users'
];

function routePermission(path: string): Permission | Permission[] | 'any' | null {
  const base = '/' + (path.split('/').filter(Boolean)[0] ?? '');
  return ROUTE_PERMISSIONS[base] ?? null;
}

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

    const perm = routePermission(path);
    const permissions = (profile.permissions as string[]) ?? [];
    if (perm && !hasPermission(permissions, perm)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'forbidden');
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
    '/dashboard/:path*', '/programmes/:path*', '/staff/:path*', '/gallery/:path*',
    '/testimonials/:path*', '/faq/:path*', '/facilities/:path*', '/hero/:path*',
    '/settings/:path*', '/contact/:path*', '/activity/:path*',
    '/enquiries/:path*', '/enrolments/:path*', '/users/:path*',
    '/login', '/login/:path*'
  ]
};
