import { NextResponse } from 'next/server'
import { EntryService } from '@/server/services/EntryService'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const entry = await EntryService.upsertEntry(data)
    return NextResponse.json(entry, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const simulationId = searchParams.get('simulationId')
    if (!simulationId) return NextResponse.json([])
    const entries = await EntryService.getEntriesBySimulation(simulationId)
    return NextResponse.json(entries)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
