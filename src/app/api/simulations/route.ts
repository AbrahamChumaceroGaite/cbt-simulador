import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get('groupId')
  const sims = await prisma.simulation.findMany({
    where: groupId ? { groupId } : undefined,
    include: { _count: { select: { entries: true } }, entries: { orderBy: { sessionNum: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(sims)
}

export async function POST(req: Request) {
  const { groupId, name, description, plantName, initialHeight, baseGrowth, optimalTemp, optimalHumidity, optimalLight } = await req.json()
  if (!groupId || !name) return NextResponse.json({ error: 'groupId y name requeridos' }, { status: 400 })
  const sim = await prisma.simulation.create({
    data: {
      groupId, name,
      description: description ?? '',
      plantName: plantName ?? '',
      initialHeight: initialHeight ?? 2.0,
      baseGrowth: baseGrowth ?? 0.30,
      optimalTemp: optimalTemp ?? 18.0,
      optimalHumidity: optimalHumidity ?? 65.0,
      optimalLight: optimalLight ?? 12.0,
    },
    include: { _count: { select: { entries: true } } },
  })
  return NextResponse.json(sim, { status: 201 })
}
