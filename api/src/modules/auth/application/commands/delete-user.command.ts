import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { NotFoundException }               from '@nestjs/common'
import { UserRepository }                  from '../../domain/user.repository'

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, void> {
  constructor(private readonly repo: UserRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Usuario no encontrado')
    await this.repo.delete(id)
  }
}
