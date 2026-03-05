import { cookies } from 'next/headers'
import { createHash } from 'crypto'

const COOKIE_NAME = 'lc-admin-session'

function getSecret(): string {
  const password = process.env.LIVE_COMMENTS_ADMIN_PASSWORD
  if (!password) throw new Error('live-comments: LIVE_COMMENTS_ADMIN_PASSWORD env var not set')
  return createHash('sha256').update(password).digest('hex')
}

function createToken(): string {
  const secret = getSecret()
  const payload = JSON.stringify({ admin: true, ts: Date.now() })
  const payloadB64 = Buffer.from(payload).toString('base64url')
  const sig = createHash('sha256').update(payloadB64 + '.' + secret).digest('base64url')
  return `${payloadB64}.${sig}`
}

function verifyToken(token: string): boolean {
  try {
    const secret = getSecret()
    const [payloadB64, sig] = token.split('.')
    if (!payloadB64 || !sig) return false
    const expectedSig = createHash('sha256').update(payloadB64 + '.' + secret).digest('base64url')
    return sig === expectedSig
  } catch {
    return false
  }
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = createToken()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function isAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return false
    return verifyToken(token)
  } catch {
    return false
  }
}
