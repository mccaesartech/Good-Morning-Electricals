import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { BASE_PATH } from '@/lib/constants';
import { ROUTE_PERMISSIONS, hasPermission, type Permission } from '@/lib/permissions';

const PUBLIC_PATHS = [`${BASE_PATH}/login`, `${BASE_PATH}/auth/callback`];

const PROTECTED_PREFIXES = [
  `${BASE_PATH}/dashboard`,
  `${BASE_PATH}/programmes`,
  `${BASE_PATH}/staff`,
  `${BASE_PATH}/gallery`,
  `${BASE_PATH}/testimonials`,
  `${BASE_PATH}/faq`,
  `${BASE_PATH}/facilities`,
  `${BASE_PATH}/hero`,
  `${BASE_PATH}/about`,
  `${BASE_PATH}/features`,
  `${BASE_PATH}/admissions`,
  `${BASE_PATH}/journey`,
  `${BASE_PATH}/careers`,
  `${BASE_PATH}/settings`,
  `${BASE_PATH}/contact`,
  `${BASE_PATH}/activity`,
  `${BASE_PATH}/enquiries`,
  `${BASE_PATH}/enrolments`,
  `${BASE_PATH}/users`
];

function routePermission(path: string): Permission | Permission[] | 'any' | null {
  const relative = path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) || '/' : path;
  const base = '/' + (relative.split('/').filter(Boolean)[0] ?? '');
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
      url.pathname = `${BASE_PATH}/login`;
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase.rpc('get_admin_profile');
    if (!profile) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = `${BASE_PATH}/login`;
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    const perm = routePermission(path);
    const permissions = (profile.permissions as string[]) ?? [];
    if (perm && !hasPermission(permissions, perm)) {
      const url = request.nextUrl.clone();
      url.pathname = `${BASE_PATH}/dashboard`;
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
  }

  if (isPublic(path) && path.startsWith(`${BASE_PATH}/login`) && user) {
    const { data: profile } = await supabase.rpc('get_admin_profile');
    if (profile) {
      const url = request.nextUrl.clone();
      url.pathname = `${BASE_PATH}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/programmes/:path*',
    '/admin/staff/:path*',
    '/admin/gallery/:path*',
    '/admin/testimonials/:path*',
    '/admin/faq/:path*',
    '/admin/facilities/:path*',
    '/admin/hero/:path*',
    '/admin/about/:path*',
    '/admin/features/:path*',
    '/admin/admissions/:path*',
    '/admin/journey/:path*',
    '/admin/careers/:path*',
    '/admin/settings/:path*',
    '/admin/contact/:path*',
    '/admin/activity/:path*',
    '/admin/enquiries/:path*',
    '/admin/enrolments/:path*',
    '/admin/users/:path*',
    '/admin/login',
    '/admin/login/:path*'
  ]
};
