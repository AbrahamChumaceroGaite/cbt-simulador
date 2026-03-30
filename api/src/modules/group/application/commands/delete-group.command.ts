import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { NotFoundException }               from '@nestjs/common'
import { GroupRepository }                 from '../../domain/group.repository'

export class DeleteGroupCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteGroupCommand)
export class DeleteGroupHandler implements ICommandHandler<DeleteGroupCommand, void> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ id }: DeleteGroupCommand): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Grupo no encontrado')
    await this.repo.delete(id)
  }
}
