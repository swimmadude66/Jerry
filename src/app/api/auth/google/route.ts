import { createSession, handleSSO, setAuthCookie } from '@jerry/utils/auth'
import { COOKIE_CONFIG } from '@jerry/utils/config'
import { verifyGoogleCredentials } from '@jerry/utils/google'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const fb = await req.formData()
  if (!fb) {
    throw new Error('Missing SSO token')
  }
  const credential = fb.get('credential')?.toString()
  const bodyCsrfToken = fb.get('g_csrf_token')?.toString()
  if (!credential || !bodyCsrfToken) {
    throw new Error('Malformed SSO token')
  }
  const cookieCsrfToken = req.cookies.get('g_csrf_token')?.value
  if (!cookieCsrfToken || cookieCsrfToken !== bodyCsrfToken) {
    throw new Error('CSRF mismatch')
  }

  try {
    const userEmail = await verifyGoogleCredentials(credential)
    const user = await handleSSO(userEmail)
    // create session
    const {key: sessionKey} = await createSession(user.id, COOKIE_CONFIG.expireMS)
    const res = NextResponse.redirect(new URL('/', req.url))
    await setAuthCookie(res, sessionKey)
    return res
  } catch (e) {
    console.error(e)
    return NextResponse.redirect(new URL('/auth', req.url))
  }
}