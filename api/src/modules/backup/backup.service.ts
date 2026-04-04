import { Injectable }    from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import type { RestoreResult } from '@simulador/shared'

const ALL_SECTIONS = ['groups', 'simulations', 'entries'] as const
type Section = typeof ALL_SECTIONS[number]

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  async export(sections: Section[] = [...ALL_SECTIONS]): Promise<object> {
    const includeEntries     = sections.includes('entries')
    const includeSimulations = sections.includes('simulations')

    const groups = await this.prisma.group.findMany({
      include: {
        members: { orderBy: { name: 'asc' } },
        ...(includeSimulations ? {
          simulations: {
            include: includeEntries
              ? { entries: { orderBy: { sessionNum: 'asc' } } }
              : undefined,
            orderBy: { createdAt: 'asc' },
          },
        } : {}),
      },
      orderBy: { course: 'asc' },
    })

    return {
      version:    1,
      exportedAt: new Date().toISOString(),
      sections,
      groups,
    }
  }

  async restore(body: Record<string, any>): Promise<RestoreResult> {
    const detected: string[] = []
    const details: RestoreResult['details'] = {}

    if (!Array.isArray(body.groups)) return { detected, details }

    detected.push('groups')
    let gCreated = 0; let gUpdated = 0

    for (const g of body.groups) {
      const gExists = await this.prisma.group.findUnique({ where: { id: g.id } })
      if (gExists) {
        await this.prisma.group.update({
          where: { id: g.id },
          data:  { name: g.name, course: g.course, plant: g.plant },
        })
        gUpdated++
      } else {
        await this.prisma.group.create({
          data: { id: g.id, code: g.code, name: g.name, course: g.course, plant: g.plant },
        })
        gCreated++
      }

      if (Array.isArray(g.members)) {
        if (!detected.includes('members')) detected.push('members')
        if (!details.members) details.members = { created: 0, updated: 0 }
        for (const m of g.members) {
          const mExists = await this.prisma.member.findUnique({ where: { id: m.id } })
          if (mExists) {
            await this.prisma.member.update({ where: { id: m.id }, data: { name: m.name } })
            details.members.updated++
          } else {
            await this.prisma.member.create({ data: { id: m.id, name: m.name, groupId: g.id } })
            details.members.created++
          }
        }
      }

      if (Array.isArray(g.simulations)) {
        if (!detected.includes('simulations')) detected.push('simulations')
        if (!details.simulations) details.simulations = { created: 0, updated: 0 }
        for (const s of g.simulations) {
          const sExists = await this.prisma.simulation.findUnique({ where: { id: s.id } })
          if (sExists) {
            // Preserve isLocked and officialPrediction — only update safe fields
            await this.prisma.simulation.update({
              where: { id: s.id },
              data:  { name: s.name, description: s.description },
            })
            details.simulations.updated++
          } else {
            await this.prisma.simulation.create({
              data: {
                id:                 s.id,
                name:               s.name,
                groupId:            g.id,
                description:        s.description        ?? '',
                isLocked:           s.isLocked           ?? false,
                officialPrediction: s.officialPrediction ?? null,
                plantName:          s.plantName          ?? '',
                initialHeight:      s.initialHeight      ?? 2.0,
                baseGrowth:         s.baseGrowth         ?? 0.30,
                optimalTemp:        s.optimalTemp        ?? 18.0,
                optimalHumidity:    s.optimalHumidity    ?? 65.0,
                optimalLight:       s.optimalLight       ?? 12.0,
                startMonth:         s.startMonth         ?? 4,
                startYear:          s.startYear          ?? 2026,
                startDay:           s.startDay           ?? 0,
                projDays:           s.projDays           ?? 45,
              },
            })
            details.simulations.created++
          }

          if (Array.isArray(s.entries)) {
            if (!detected.includes('entries')) detected.push('entries')
            if (!details.entries) details.entries = { created: 0 }
            for (const e of s.entries) {
              const eExists = await this.prisma.entry.findUnique({ where: { id: e.id } })
              if (!eExists) {
                await this.prisma.entry.create({
                  data: {
                    id:           e.id,
                    simulationId: s.id,
                    sessionNum:   e.sessionNum,
                    date:         e.date ? new Date(e.date) : new Date(),
                    realHeight:   e.realHeight   ?? null,
                    temperature:  e.temperature  ?? null,
                    humidity:     e.humidity     ?? null,
                    lightHours:   e.lightHours   ?? null,
                    note:         e.note         ?? '',
                    myPrediction: e.myPrediction ?? null,
                  },
                })
                details.entries.created++
              }
              // entries are never overwritten — measurements are sacred
            }
          }
        }
      }
    }
    details.groups = { created: gCreated, updated: gUpdated }

    return { detected, details }
  }
}
