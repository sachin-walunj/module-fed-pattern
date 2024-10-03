import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/share/:id?', '/showroom/:id?']

export function middleware(request: NextRequest) {
  // Need to check only for the token from amp-api
  const authenticated = request.cookies.get('access_token')?.value
  const url = request.nextUrl.clone()

  if (
    !authenticated &&
    !publicRoutes.includes(request.nextUrl.pathname) &&
    process.env.NODE_ENV === 'development'
  ) {
    url.pathname = '/api/auth/login'
    return NextResponse.redirect(url, { status: 302 })
  }

  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/v3') {
    url.pathname = `${process.env.ROUTE_PREFIX_V3}/portal`

    return NextResponse.redirect(url, { status: 302 })
  }

  // const [hostname] = request.headers.get('host')?.split('.') ?? []
  // await getInitialData(hostname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    // '/((?!_next/static|_next/image|favicons|images|favicon.ico).*)',
    '/',
  ],
}
