import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isLogin = path === '/login' || path.startsWith('/login/');
  const isDashboard = path === '/dashboard' || path.startsWith('/dashboard/');

  if (isDashboard) {
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

  if (isLogin && user) {
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
  matcher: ['/dashboard/:path*', '/login', '/login/:path*']
};
