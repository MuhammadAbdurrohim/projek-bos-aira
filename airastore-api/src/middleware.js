import { NextResponse } from 'next/server';
import { AUTH } from '@/lib/constants';

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/login',
  '/api/register',
];

// Paths that require admin access
const adminPaths = [
  '/dashboard',
  '/dashboard/produk',
  '/dashboard/kategori',
  '/dashboard/pesanan',
  '/dashboard/pengguna',
  '/dashboard/pengaturan',
  '/dashboard/live-stream',
  '/dashboard/payment-confirmations',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get(AUTH.TOKEN_KEY);

  // If no token and trying to access protected route
  if (!token) {
    // If accessing admin route, redirect to admin login
    if (adminPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // For other protected routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token but accessing auth pages, redirect to dashboard
  if (token && publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check for admin access on admin routes
  if (adminPaths.some(path => pathname.startsWith(path))) {
    try {
      // Get user role from token or API call
      const userRole = request.cookies.get('user_role');
      
      if (userRole !== AUTH.ROLES.ADMIN) {
        // If not admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // If error checking role, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Add auth headers to API requests
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Authorization', `Bearer ${token}`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/webhook routes
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /public files
     */
    '/((?!api/webhook|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
