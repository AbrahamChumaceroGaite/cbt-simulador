import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  return NextResponse.json(session)
}
