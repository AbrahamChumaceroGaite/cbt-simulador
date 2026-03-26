import { NextResponse } from 'next/server'
import { SimulationService } from '@/server/services/SimulationService'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')
    const sims = await SimulationService.getSimulationsByGroup(groupId)
    return NextResponse.json(sims)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const sim = await SimulationService.createSimulation(data)
    return NextResponse.json(sim, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
