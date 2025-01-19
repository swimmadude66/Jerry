import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_CONFIG } from './config';
import { signValue, verifySignedValue } from './crypto';


export interface CookieOpts {
  name: string 
  value: string
  domain?: string
  path?: string
  expires?: number
  secure?: boolean
  signingSecret?: string
  sameSite?: boolean
  httpOnly?: boolean
  priority?: 'low' | 'medium' | 'high'
}

export type CookieRetrievalOpts = Pick<CookieOpts, 'name' | 'signingSecret'>

export function isRequestSecure(req: NextRequest): boolean {
  const reqProto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol
  console.log(reqProto)
  if (reqProto?.toLowerCase().trim() === 'https') {
    return true
  }
  return false
}

export async function setCookie(res: NextResponse, {name = COOKIE_CONFIG.name, value, secure = false, domain = COOKIE_CONFIG.domain, expires = COOKIE_CONFIG.expireMS, sameSite, httpOnly, priority, signingSecret }: CookieOpts): Promise<void> {

  let cookieVal = value
  if (signingSecret) {
    cookieVal = await signValue(value, signingSecret) 
  }

  res.cookies.set(
      {
        name,
        value: cookieVal,
        domain,
        secure,
        sameSite,
        httpOnly,
        expires,
        priority, 
        maxAge: expires / 1000,
      }
  )
}

export async function deleteCookie(res: NextResponse, key: string) {
  res.cookies.delete(key)
}

export async function getCookie(req: NextRequest, {name, signingSecret}: CookieRetrievalOpts): Promise<string | undefined> {
  let value = req.cookies.get(name)?.value
  if (value && value.includes('.') && signingSecret) {
    value = await verifySignedValue(value, signingSecret)
  }
  return value
}