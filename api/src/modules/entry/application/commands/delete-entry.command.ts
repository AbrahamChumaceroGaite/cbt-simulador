import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { NotFoundException }               from '@nestjs/common'
import { EntryRepository }                 from '../../domain/entry.repository'

export class DeleteEntryCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteEntryCommand)
export class DeleteEntryHandler implements ICommandHandler<DeleteEntryCommand, void> {
  constructor(private readonly repo: EntryRepository) {}

  async execute({ id }: DeleteEntryCommand): Promise<void> {
    // Attempt delete — Prisma will throw if not found
    try {
      await this.repo.delete(id)
    } catch {
      throw new NotFoundException('Sesión no encontrada')
    }
  }
}
