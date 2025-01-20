import { NextRequest, NextResponse } from 'next/server';
import { User } from './types/auth';
import { COOKIE_CONFIG } from './utils/config';

const PUBLIC_ROUTE_PREFIXES = [
  '/api',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/sitemap.xml',
  '/robots.txt',
  '/assets/'
]

const authRoute = '/auth'

async function checkAuthState(req: NextRequest): Promise<{valid: boolean; user?: User}> {
  const authCookie = req.cookies.get(COOKIE_CONFIG.name)?.value
  if (!authCookie) {
    return {valid: false}
  }
  try {
    const headers = new Headers()
    headers.append('Cookie', `${COOKIE_CONFIG.name}=${authCookie}`)
    const authResponse = await fetch(new URL('/api/auth', req.url), {method: 'GET', headers})
    const authBody = await authResponse.json()
    return {valid: Boolean(authBody?.['valid']), user: authBody?.user}
  } catch (e) {
    console.error('Error validating auth', e)
    return {valid: false}
  }
}

export default async function middleware(req: NextRequest) {
  const reqPath = req.nextUrl.pathname
  if (PUBLIC_ROUTE_PREFIXES.some((p) => reqPath.startsWith(p))) {
    return NextResponse.next()
  }
  const {valid} = await checkAuthState(req)
  if (reqPath === authRoute) {
    if (valid) {
      console.log('Already logged in, redirecting')
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }
  if (!valid) {
    console.log('Invalid auth, redirecting')
    return NextResponse.redirect(new URL('/auth', req.url))
  }
  const res = NextResponse.next()
  return res
}