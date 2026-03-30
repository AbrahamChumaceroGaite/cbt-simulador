import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { MemberRepository }                from '../../domain/member.repository'

export class DeleteMemberCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteMemberCommand)
export class DeleteMemberHandler implements ICommandHandler<DeleteMemberCommand, void> {
  constructor(private readonly repo: MemberRepository) {}

  async execute({ id }: DeleteMemberCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
