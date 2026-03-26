import { NextResponse, NextRequest } from 'next/server'
import { MemberService } from '@/server/services/MemberService'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('groupId')
  if (!groupId) return NextResponse.json({ error: 'groupId requerido' }, { status: 400 })
  const members = await MemberService.getByGroup(groupId)
  return NextResponse.json(members)
}

export async function POST(req: Request) {
  try {
    const { groupId, name, role = '' } = await req.json()
    if (!groupId || !name?.trim()) return NextResponse.json({ error: 'groupId y name requeridos' }, { status: 400 })
    const member = await MemberService.create(groupId, name, role)
    return NextResponse.json(member)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
