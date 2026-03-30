import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { MemberRepository }                from '../../domain/member.repository'
import { MemberMapper }                    from '../member.mapper'
import type { MemberResponse }             from '@simulador/shared'

export class CreateMemberDto {
  @IsString()   @IsNotEmpty() groupId!: string
  @IsString()   @IsNotEmpty() name!:    string
  @IsOptional() @IsString()   role?:    string
}

export class CreateMemberCommand {
  constructor(public readonly dto: CreateMemberDto) {}
}

@CommandHandler(CreateMemberCommand)
export class CreateMemberHandler implements ICommandHandler<CreateMemberCommand, MemberResponse> {
  constructor(private readonly repo: MemberRepository) {}

  async execute({ dto }: CreateMemberCommand): Promise<MemberResponse> {
    const entity = await this.repo.create(dto.groupId, { name: dto.name, role: dto.role })
    return MemberMapper.toResponse(entity)
  }
}
