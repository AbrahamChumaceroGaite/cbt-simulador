import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sim = await prisma.simulation.findUnique({
    where: { id: params.id },
    include: { entries: { orderBy: { sessionNum: 'asc' } }, group: true },
  })
  if (!sim) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(sim)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const sim = await prisma.simulation.update({
    where: { id: params.id },
    data,
    include: { entries: { orderBy: { sessionNum: 'asc' } }, group: true },
  })
  return NextResponse.json(sim)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.simulation.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
