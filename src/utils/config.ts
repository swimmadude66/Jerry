
export const COOKIE_CONFIG = {
  name: process.env.AUTH_COOKIE_NAME || '__jerry_session',
  domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
  expireMS: +(process.env.AUTH_COOKIE_MAX_AGE || (1000 * 60 * 60 * 24 * 7)) // 1 week
}