import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        members: true,
        simulations: {
          where:   { isDemo: false },
          include: {
            entries: { orderBy: { sessionNum: 'asc' } },
          },
        },
      },
      orderBy: { course: 'asc' },
    })

    const stats = groups.map(g => {
      const realSims = g.simulations
      const totalEntries = realSims.reduce((sum, s) => sum + s.entries.length, 0)

      // Best progress: sim with most real height recorded
      let bestHeight: number | null = null
      let bestSimName = ''
      let totalDiff   = 0
      let diffCount   = 0

      realSims.forEach(sim => {
        sim.entries.forEach(e => {
          if (e.realHeight != null) {
            if (bestHeight === null || e.realHeight > bestHeight) {
              bestHeight  = e.realHeight
              bestSimName = sim.name
            }
            // Simple diff: real vs initial height as proxy
            const days  = (e.sessionNum - 1) * 3.5
            const model = sim.initialHeight + sim.baseGrowth * days
            totalDiff  += e.realHeight - model
            diffCount  ++
          }
        })
      })

      const avgDiff = diffCount > 0 ? Math.round((totalDiff / diffCount) * 10) / 10 : null

      return {
        id:           g.id,
        name:         g.name,
        course:       g.course,
        plant:        g.plant,
        code:         g.code,
        memberCount:  g.members.length,
        simCount:     realSims.length,
        totalEntries,
        bestHeight,
        bestSimName,
        avgDiff,
      }
    })

    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
