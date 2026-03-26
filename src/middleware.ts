import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.match(/\.(png|jpg|svg|ico|css|js)$/)) return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Groups can only access their own group page and public API
  if (session.role === 'group') {
    const allowed =
      pathname === '/' ||
      pathname.startsWith(`/grupo/${session.groupId}`) ||
      pathname.startsWith('/api/entries') ||
      pathname.startsWith('/api/simulations') ||
      pathname.startsWith('/api/members') ||
      pathname.startsWith('/api/groups') ||
      pathname.startsWith('/api/climate') ||
      pathname.startsWith('/api/auth')
    if (!allowed) {
      return NextResponse.redirect(new URL(`/grupo/${session.groupId}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
