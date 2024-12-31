import {v4 as uuid} from 'uuid';
import { hash as argonHash } from 'argon2'
import * as jose from 'node-jose'

export function genUUID() {
  return uuid()
}

export async function hash(text: string, salt: string = genUUID()): Promise<string> {
  return await argonHash(`${text}`, {salt: Buffer.from(salt)})
}

export async function verifyJWS(input: string, keystore?: string | Object): Promise<Buffer> {
  const result = await jose.JWS.createVerify(keystore).verify(input, {allowEmbeddedKey: !keystore})
  return result.payload
}