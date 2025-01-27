import { Session, User } from '@jerry/types/auth';
import { sql } from './db';
import { genUUID, hash } from './crypto';
import { NextRequest, type NextResponse } from 'next/server';
import { deleteCookie, getCookie, setCookie } from './cookies';
import { COOKIE_CONFIG } from './config';

const COOKIE_SIGNING_KEY = process.env.AUTH_COOKIE_SECRET
const DOMAIN_OWNER_EMAIL = process.env.DOMAIN_OWNER_EMAIL

export async function loginWithPassword({email, password}: {email: string; password: string}): Promise<User | undefined> {

  const [userRow] = await sql`Select * from "user" Where email=${email} LIMIT 1;`

  if (!userRow) {
    return undefined
  }
  const {pass_hash, pass_salt, id, user_name, avatar_url, is_admin} = userRow
  if (!pass_hash || !pass_salt) {
    return undefined
  }
  const hashCheck = await hash(password, pass_salt)
  if (hashCheck === pass_hash) {
    if (DOMAIN_OWNER_EMAIL === email && !is_admin) {
      await updateUserIsAdmin(email, true)
    }
    return {
      id, email, name: user_name, avatar: avatar_url, isAdmin: is_admin
    }
  } else {
    return undefined
  }
}

export async function registerUserPassword(email: string, password: string): Promise<User | undefined> {
  const [existingUserRow] = await sql`Select * from "user" Where email=${email} LIMIT 1;`
  if (existingUserRow) {
    return undefined
  }
  const salt = genUUID()
  const passHash = await hash(password, salt)

  const isAdmin = (DOMAIN_OWNER_EMAIL === email)

  const [{id}] = await sql`Insert into "user" ("email", "pass_hash", "pass_salt", "is_admin") VALUES (${email}, ${passHash}, ${salt}, ${isAdmin}) returning id;`
  return {id, email, isAdmin}
}

export async function handleSSO({email, name, picture}: {email: string; name?: string; picture?: string}): Promise<User> {
  const [existingUserRow] = await sql`Select * from "user" Where email=${email} LIMIT 1;`
  const isAdmin = (DOMAIN_OWNER_EMAIL === email)
  if (!existingUserRow) {
    const [{id}] = await sql`Insert into "user" ("email", "user_name", "avatar_url", "is_admin") VALUES (${email}, ${name ?? null}, ${picture ?? null}, ${isAdmin}) returning id;`
    return {id, email, name, avatar: picture, isAdmin}
  } else {
    if (isAdmin && !existingUserRow.is_admin) {
      await updateUserIsAdmin(email, true)
    }
    return {id: existingUserRow.id, email, name: existingUserRow.user_name, avatar: existingUserRow.avatar_url, isAdmin: existingUserRow.is_admin || isAdmin}
  }
}

async function updateUserIsAdmin(email: string, isAdmin: boolean): Promise<void> {
  await sql`Update "user" SET "is_admin" = ${isAdmin} WHERE "email"=${email};`
}

export async function validateSession(sessionKey?: string): Promise<User | undefined> {
  if (!sessionKey) {
    return undefined
  }
  const [session] = await sql`
    SELECT 
      "user"."id" as "user_id",
      "user"."email" as "email",
      "user"."user_name" as "name",
      "user"."avatar_url" as "avatar",
      "user"."is_admin" as "isAdmin"
    FROM "session" 
      JOIN "user" on "session"."user_id" = "user"."id"
    WHERE 1=1
      AND "session"."key" = ${sessionKey} 
      AND "session"."expires" > ${Date.now()}
      AND "session"."active"
    LIMIT 1;
  `
  if (!session) {
    return undefined;
  }
  return {email: session.email, id: session.user_id, name: session.name, avatar: session.avatar, isAdmin: session.isAdmin}
}

export async function createSession(userId: string, expireMS: number = 7 * 24 * 60 * 60 * 1000): Promise<Session> {
  const [session] = await sql`Insert into "session" ("key", "user_id", "expires") VALUES (${genUUID()}, ${userId}, ${Date.now() + expireMS}) returning key, expires;`
  return {key: session.key, expires: session.expires}
}

export async function invalidateSession(sessionKey: string): Promise<void> {
  await sql`Update "session" SET active = FALSE WHERE "key"=${sessionKey};`
}

export async function setAuthCookie(res: NextResponse, sessionKey: string): Promise<void> {
  await setCookie(res, {
      name: COOKIE_CONFIG.name,
      value: sessionKey,
      domain: COOKIE_CONFIG.domain,
      sameSite: true,
      httpOnly: true,
      expires: COOKIE_CONFIG.expireMS,
      priority: 'high',
      signingSecret: COOKIE_SIGNING_KEY
    })
}

export async function deleteAuthCookie(res: NextResponse): Promise<void> {
  await deleteCookie(res, COOKIE_CONFIG.name)
}

export async function getAuthCookie(req: NextRequest): Promise<string | undefined> {
  return getCookie(req, {name: COOKIE_CONFIG.name, signingSecret: COOKIE_SIGNING_KEY})
}

export async function getAuthUser(req: NextRequest): Promise<User | undefined> {
  try {
    const sessionKey = await getAuthCookie(req)
    if (!sessionKey) {
      return undefined
    }
    const sessionUser = await validateSession(sessionKey)
    if (!sessionUser) {
      return undefined
    }
    return sessionUser
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return undefined
  }
}