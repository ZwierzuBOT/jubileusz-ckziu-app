import { clerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = (path) => {
  const publicRoutes = ['/sign-in', '/sign-up'];
  return publicRoutes.some((route) => path.startsWith(route));
};

export default clerkMiddleware((auth, request) => {
  const { userId } = getAuth(request);
  const { pathname } = request.nextUrl;

  // Redirect to "/sign-in" if not signed in and path is "/"
  if (!userId && (pathname === '/' )) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access to public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Protect other routes (requires authentication)
  return auth.protect();
});

export const config = {
  matcher: [
    // Match all routes for potential middleware processing
    '/((?!_next|.*\\.(?:ico|jpg|jpeg|png|svg|css|js|json)).*)',
  ],
};
