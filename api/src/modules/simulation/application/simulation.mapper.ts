import type { SimulationEntity } from '../domain/simulation.entity'
import type { SimulationResponse, EntryResponse } from '@simulador/shared'

export class SimulationMapper {
  static toResponse(entity: SimulationEntity): SimulationResponse {
    return {
      id:                 entity.id,
      groupId:            entity.groupId,
      name:               entity.name,
      description:        entity.description,
      plantName:          entity.plantName,
      isDemo:             entity.isDemo,
      isLocked:           entity.isLocked,
      initialHeight:      entity.initialHeight,
      baseGrowth:         entity.baseGrowth,
      optimalTemp:        entity.optimalTemp,
      optimalHumidity:    entity.optimalHumidity,
      optimalLight:       entity.optimalLight,
      officialPrediction: entity.officialPrediction,
      predictionNote:     entity.predictionNote,
      startMonth:         entity.startMonth,
      startYear:          entity.startYear,
      startDay:           entity.startDay,
      projDays:           entity.projDays,
      createdAt:          entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      group:              entity.group,
      entries:            entity.entries?.map(e => ({
        id:           e.id,
        simulationId: (e as any).simulationId ?? entity.id,
        sessionNum:   e.sessionNum,
        date:         (e as any).date instanceof Date ? (e as any).date.toISOString() : ((e as any).date ?? new Date().toISOString()),
        myPrediction: (e as any).myPrediction ?? null,
        realHeight:   e.realHeight,
        temperature:  (e as any).temperature ?? null,
        humidity:     (e as any).humidity ?? null,
        lightHours:   (e as any).lightHours ?? null,
        note:         (e as any).note ?? '',
      } as EntryResponse)),
      _count:             entity._count,
    }
  }
}
