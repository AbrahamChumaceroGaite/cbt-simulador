import type { EntryEntity } from './entry.entity'
import type { EntryInput }  from '@simulador/shared'

export abstract class EntryRepository {
  abstract findBySimulation(simulationId: string): Promise<EntryEntity[]>
  abstract upsert(data: EntryInput): Promise<EntryEntity>
  abstract delete(id: string): Promise<void>
}
