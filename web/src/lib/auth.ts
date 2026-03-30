/**
 * JWT utilities — edge-safe (jose only, no bcryptjs/prisma imports here).
 */
import { jwtVerify } from 'jose'
import type { SessionPayload } from '@simulador/shared'

export type { SessionPayload }

export const COOKIE_NAME = 'cbt_plants_session'
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'cbt-plants-dev-secret')

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
