import { createSession, loginWithPassword } from '@jerry/utils/auth';
import { COOKIE_CONFIG } from '@jerry/utils/config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body;
  try {
    body = await req.json()
    if (!body || typeof body !== 'object') {
      throw new Error('Missing or invalid body')
    }
  } catch (e) {
    console.error('Error parsing post body to /auth', {error: e, body})
    return NextResponse.json({message: 'Invalid JSON provided for request body'}, {status: 400})
  }
  if (!body.email || !body.password) {
    return NextResponse.json({message: 'Missing username or password in request body'}, {status: 400})
  }
  const user = await loginWithPassword(body)
  if (!user) {
    return NextResponse.json({message: 'Invalid username or password'}, {status: 400})
  }
  const {key: sessionKey, expires} = await createSession(user.id, COOKIE_CONFIG.expireMS)
  
  const res = NextResponse.redirect(new URL('/', req.url))
  res.cookies.set(
    {
      name: COOKIE_CONFIG.name,
      value: sessionKey,
      domain: COOKIE_CONFIG.domain,
      sameSite: true,
      httpOnly: true,
      expires,
      maxAge: expires / 1000,
    }
  )
  return res
}