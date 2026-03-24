import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      simulations: {
        include: { _count: { select: { entries: true } }, entries: { orderBy: { sessionNum: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!group) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(group)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const group = await prisma.group.update({ where: { id: params.id }, data })
  return NextResponse.json(group)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.group.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

// Find by code
export async function POST(req: Request, { params }: { params: { id: string } }) {
  // params.id is actually the code when called as /api/groups/[code]
  const group = await prisma.group.findUnique({
    where: { code: params.id.toUpperCase() },
    include: { _count: { select: { simulations: true } } },
  })
  if (!group) return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 })
  return NextResponse.json(group)
}
