import { ICommandHandler, CommandHandler }  from '@nestjs/cqrs'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { NotFoundException }                from '@nestjs/common'
import { MemberRepository }                 from '../../domain/member.repository'
import { MemberMapper }                     from '../member.mapper'
import type { MemberResponse }              from '@simulador/shared'

export class UpdateMemberDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string
  @IsOptional() @IsString()               role?: string
}

export class UpdateMemberCommand {
  constructor(public readonly id: string, public readonly dto: UpdateMemberDto) {}
}

@CommandHandler(UpdateMemberCommand)
export class UpdateMemberHandler implements ICommandHandler<UpdateMemberCommand, MemberResponse> {
  constructor(private readonly repo: MemberRepository) {}

  async execute({ id, dto }: UpdateMemberCommand): Promise<MemberResponse> {
    const entity = await this.repo.update(id, { name: dto.name ?? '', role: dto.role })
    return MemberMapper.toResponse(entity)
  }
}
