import { Session, User } from '@jerry/types/auth';
import { sql } from './db';
import { genUUID, hash } from './crypto';
import { NextRequest, type NextResponse } from 'next/server';
import { getCookie, setCookie } from './cookies';
import { COOKIE_CONFIG } from './config';

const COOKIE_SIGNING_KEY = process.env.AUTH_COOKIE_SECRET

export async function loginWithPassword({email, password}: {email: string; password: string}): Promise<User | undefined> {

  const [userRow] = await sql`Select * from "user" Where email=${email} LIMIT 1;`

  if (!userRow) {
    return undefined
  }
  const {id, pass_hash, pass_salt} = userRow
  if (!pass_hash || !pass_salt) {
    return undefined
  }
  const hashCheck = await hash(password, pass_salt)
  if (hashCheck === pass_hash) {
    return {
      id, email
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

  const [{id}] = await sql`Insert into "user" ("email", "pass_hash", "pass_salt") VALUES (${email}, ${passHash}, ${salt}) returning id;`
  return {id, email}
}

export async function handleSSO(email: string): Promise<User> {
  const [existingUserRow] = await sql`Select * from "user" Where email=${email} LIMIT 1;`
  if (!existingUserRow) {
    const [{id}] = await sql`Insert into "user" ("email") VALUES (${email}) returning id;`
    return {id, email}
  } else {
    return {id: existingUserRow.id, email}
  }
}


export async function validateSession(sessionKey?: string): Promise<User | undefined> {
  if (!sessionKey) {
    return undefined
  }
  const [session] = await sql`
    SELECT 
      "user"."id" as "user_id",
      "user"."email" as "email"
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
  return {email: session.email, id: session.user_id}
}

export async function createSession(userId: string, expireMS: number = 7 * 24 * 60 * 60 * 1000): Promise<Session> {
  const [session] = await sql`Insert into "session" ("key", "user_id", "expires") VALUES (${genUUID()}, ${userId}, ${Date.now() + expireMS}) returning key, expires;`
  return {key: session.key, expires: session.expires}
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

export async function getAuthCookie(req: NextRequest): Promise<string | undefined> {
  return getCookie(req, {name: COOKIE_CONFIG.name, signingSecret: COOKIE_SIGNING_KEY})
}