import { NextResponse } from 'next/server'
import { GroupService } from '@/server/services/GroupService'

export async function GET() {
  try {
    const groups = await GroupService.getAllGroups()
    return NextResponse.json(groups)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const group = await GroupService.createGroup(data)
    return NextResponse.json(group, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
