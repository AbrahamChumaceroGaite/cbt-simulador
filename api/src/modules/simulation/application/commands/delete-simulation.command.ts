import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { NotFoundException }               from '@nestjs/common'
import { SimulationRepository }            from '../../domain/simulation.repository'

export class DeleteSimulationCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteSimulationCommand)
export class DeleteSimulationHandler implements ICommandHandler<DeleteSimulationCommand, void> {
  constructor(private readonly repo: SimulationRepository) {}

  async execute({ id }: DeleteSimulationCommand): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Simulación no encontrada')
    await this.repo.delete(id)
  }
}
