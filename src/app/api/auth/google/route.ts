import { createSession, handleSSO, setAuthCookie } from '@jerry/utils/auth'
import { COOKIE_CONFIG } from '@jerry/utils/config'
import { verifyGoogleCredentials } from '@jerry/utils/google'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const {credential, clientId} = await req.json()
    if (!credential || !clientId) {
      throw new Error('No Google token found')
    }
    if (clientId !== process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID) {
      throw new Error('Google token does not correspond to correct application')
    }
    const googleUser = await verifyGoogleCredentials(credential)
    // TODO filter by approved domains
    const user = await handleSSO(googleUser)
    // create session
    const {key: sessionKey} = await createSession(user.id, COOKIE_CONFIG.expireMS)
    const res = NextResponse.json({session: sessionKey, user})
    // const res = NextResponse.redirect(new URL('/', req.url))
    await setAuthCookie(res, sessionKey)
    return res
  } catch (e) {
    console.error('Google auth error:', e)
    return NextResponse.json({message: "Could not log in with Google", error: e}, {status: 400})
  }
}