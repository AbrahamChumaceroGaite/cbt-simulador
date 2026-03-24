import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { simulationId, sessionNum, date, myPrediction, realHeight, temperature, humidity, lightHours, note } = await req.json()
  if (!simulationId || !sessionNum) return NextResponse.json({ error: 'simulationId y sessionNum requeridos' }, { status: 400 })

  // Upsert by simulationId + sessionNum
  const existing = await prisma.entry.findFirst({ where: { simulationId, sessionNum } })

  const data = {
    simulationId, sessionNum,
    date: date ? new Date(date) : new Date(),
    myPrediction: myPrediction ?? null,
    realHeight: realHeight ?? null,
    temperature: temperature ?? null,
    humidity: humidity ?? null,
    lightHours: lightHours ?? null,
    note: note ?? '',
  }

  const entry = existing
    ? await prisma.entry.update({ where: { id: existing.id }, data })
    : await prisma.entry.create({ data })

  return NextResponse.json(entry, { status: 201 })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const simulationId = searchParams.get('simulationId')
  if (!simulationId) return NextResponse.json([])
  const entries = await prisma.entry.findMany({
    where: { simulationId },
    orderBy: { sessionNum: 'asc' },
  })
  return NextResponse.json(entries)
}
