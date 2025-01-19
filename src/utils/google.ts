import { verifyJWS } from './crypto';
import { JWK } from 'node-jose'


export interface GoogleUserInfo {
  email: string
  email_verified?: boolean
  hd?: string
  name?: string
  picture?: string
}

const cache: {value: JWK.KeyStore | null; expires: number} = {
  value: null,
  expires: 0
}

export async function getGoogleKeys(): Promise<JWK.KeyStore> {
  const now = Date.now()
  if (cache.value && cache.expires > now) {
    return cache.value
  }
  const keysResponse = await fetch("https://www.googleapis.com/oauth2/v3/certs", { method: "GET" });
  const keys = await keysResponse.json()
  const keystore = await JWK.asKeyStore(keys)
  if (keysResponse.status === 200 && keys) {
    cache.value = keystore
    cache.expires = now + (24 * 60 * 60 * 1000)
  }
  return keystore
}

export async function verifyGoogleCredentials(creds: string): Promise<GoogleUserInfo> {
  const keys = await getGoogleKeys()
  const payloadBuffer = await verifyJWS(creds, keys)
  const payloadString = payloadBuffer.toString('utf8')
  const payload = JSON.parse(payloadString)
  if (payload.aud !== process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID) {
    throw Error('Google credential audience does not match app client id')
  }
  if (!/(https:\/\/)?accounts\.google\.com/i.test(payload.iss ?? '')) {
    throw Error('Invalid issuer for google credential')
  }
  const nbf = (payload.nbf ?? 0) * 1000
  const exp = (payload.exp ?? 0) * 1000
  const now = Date.now()
  if (now < nbf || now > exp) {
    throw new Error('Google credential is not valid at this time')
  }
  const {hd, email, name, picture, email_verified} = payload
  return {hd, email, name, picture, email_verified}
}