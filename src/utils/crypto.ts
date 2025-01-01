import {v4 as uuid} from 'uuid';
import { hash as argonHash } from 'argon2'
import * as jose from 'node-jose'

export function genUUID() {
  return uuid()
}

export async function hash(text: string, salt: string = genUUID()): Promise<string> {
  return await argonHash(`${text}`, {salt: Buffer.from(salt)})
}

export async function verifyJWS(input: string, keystore?: string | object): Promise<Buffer> {
  const result = await jose.JWS.createVerify(keystore).verify(input, {allowEmbeddedKey: !keystore})
  return result.payload
}

export function padSecret(raw: string, length = 256): string {
  const repeats = Math.ceil(length/raw.length)
  const full = Array(repeats).fill(raw).join('').slice(0, length)
  return full
}

export async function signValue(value: string, secret: string): Promise<string> {
  const sig = await argonHash(value, {secret: Buffer.from(padSecret(secret))})
  return `${jose.util.base64url.encode(value)}.${jose.util.base64url.encode(sig)}`
}

export async function verifySignedValue(signedValue: string, secret: string): Promise<string> {
  try {
    const [value, signature] = signedValue.split('.', 2).map((v) => jose.util.base64url.decode(v).toString('utf8'))
    const sig = await argonHash(value, {secret: Buffer.from(padSecret(secret))})
    if (sig !== signature) {
      throw new Error('Signatures do not match')
    }
    return value
  } catch (e) {
    throw new Error('Could not verify signed value with provided secret')
  }
}