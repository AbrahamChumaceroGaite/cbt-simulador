import { NextResponse } from 'next/server'
import { SimulationService } from '@/server/services/SimulationService'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const sim = await SimulationService.getSimulationById(params.id)
    if (!sim) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(sim)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const sim = await SimulationService.updateSimulation(params.id, data)
    return NextResponse.json(sim)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await SimulationService.deleteSimulation(params.id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
