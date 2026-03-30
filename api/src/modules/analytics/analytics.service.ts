import { Injectable }  from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import type { GroupStatResponse } from '@simulador/shared'

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroupStats(): Promise<GroupStatResponse[]> {
    const groups = await this.prisma.group.findMany({
      include: {
        members: true,
        simulations: {
          where:   { isDemo: false },
          include: { entries: { orderBy: { sessionNum: 'asc' } } },
        },
      },
      orderBy: { course: 'asc' },
    })

    return groups.map(g => {
      const realSims     = g.simulations
      const totalEntries = realSims.reduce((sum, s) => sum + s.entries.length, 0)

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
            const days  = (e.sessionNum - 1) * 3.5
            const model = sim.initialHeight + sim.baseGrowth * days
            totalDiff  += e.realHeight - model
            diffCount++
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
  }
}
