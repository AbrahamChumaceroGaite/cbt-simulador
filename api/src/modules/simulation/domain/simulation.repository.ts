import type { SimulationEntity }                     from './simulation.entity'
import type { SimulationInput, SimulationUpdateInput } from '@simulador/shared'

export abstract class SimulationRepository {
  abstract findByGroup(groupId?: string | null): Promise<SimulationEntity[]>
  abstract findById(id: string): Promise<SimulationEntity | null>
  abstract create(data: SimulationInput): Promise<SimulationEntity>
  abstract update(id: string, data: SimulationUpdateInput): Promise<SimulationEntity>
  abstract delete(id: string): Promise<void>
}
