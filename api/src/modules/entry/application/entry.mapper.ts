import type { EntryEntity }   from '../domain/entry.entity'
import type { EntryResponse } from '@simulador/shared'

export class EntryMapper {
  static toResponse(entity: EntryEntity): EntryResponse {
    return {
      id:           entity.id,
      simulationId: entity.simulationId,
      sessionNum:   entity.sessionNum,
      date:         entity.date instanceof Date ? entity.date.toISOString().slice(0, 10) : String(entity.date).slice(0, 10),
      myPrediction: entity.myPrediction,
      realHeight:   entity.realHeight,
      temperature:  entity.temperature,
      humidity:     entity.humidity,
      lightHours:   entity.lightHours,
      note:         entity.note,
    }
  }
}
