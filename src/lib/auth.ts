/**
 * JWT utilities — edge-safe (jose only, no bcryptjs/prisma imports here).
 */
import { SignJWT, jwtVerify } from 'jose'

export type SessionPayload = {
  userId: string
  role: 'admin' | 'group'
  groupId?: string
  code: string
  fullName: string
}

export const COOKIE_NAME = 'cbt_plants_session'
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'cbt-plants-dev-secret')

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
