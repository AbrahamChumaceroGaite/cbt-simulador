import { NextResponse } from 'next/server'
import { MemberService } from '@/server/services/MemberService'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, role = '' } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'name requerido' }, { status: 400 })
    const member = await MemberService.update(params.id, name, role)
    return NextResponse.json(member)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await MemberService.delete(params.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
