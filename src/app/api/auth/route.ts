import { NextRequest, NextResponse } from 'next/server';
import { createSession, deleteAuthCookie, getAuthCookie, invalidateSession, registerUserPassword, setAuthCookie, validateSession } from '@jerry/utils/auth';
import { COOKIE_CONFIG } from '@jerry/utils/config';

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({message: 'No request body provided'}, {status: 400})
  }
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
  const user = await registerUserPassword(body.email, body.password)
  if (!user) {
    return NextResponse.json({message: 'User already exists or cannot be registered. Please contact an administrator.'}, {status: 400})
  }
  const {key: sessionKey} = await createSession(user.id, COOKIE_CONFIG.expireMS)
  const res = NextResponse.json({session: sessionKey, user: user}, {status: 200})
  await setAuthCookie(res, sessionKey)
  return res
}

export async function GET(req: NextRequest) {
  try {
    const sessionKey = await getAuthCookie(req)
    if (!sessionKey) {
      return NextResponse.json({valid: false}, {status: 403})
    }
    const sessionUser = await validateSession(sessionKey)
    if (!sessionUser) {
      throw new Error(`Provided session key is invalid: ${JSON.stringify({sessionKey})}`, )
    }
    return NextResponse.json({valid: true, user: sessionUser})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({valid: false}, {status: 403})
  }
}

export async function DELETE(req: NextRequest) {
  const sessionCookie = await getAuthCookie(req)
  const res = NextResponse.json({message: 'Logged out'}, {status: 200})
  if (sessionCookie) {
    await invalidateSession(sessionCookie)
  }
  await deleteAuthCookie(res)
  return res;
}