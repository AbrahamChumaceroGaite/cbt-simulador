import { ICommandHandler, CommandHandler }  from '@nestjs/cqrs'
import { IsOptional, IsString }             from 'class-validator'
import { NotFoundException }                from '@nestjs/common'
import { GroupRepository }                  from '../../domain/group.repository'
import { GroupMapper }                      from '../group.mapper'
import type { GroupResponse }               from '@simulador/shared'

export class UpdateGroupDto {
  @IsOptional() @IsString() name?:   string
  @IsOptional() @IsString() course?: string
  @IsOptional() @IsString() plant?:  string
}

export class UpdateGroupCommand {
  constructor(public readonly id: string, public readonly dto: UpdateGroupDto) {}
}

@CommandHandler(UpdateGroupCommand)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroupCommand, GroupResponse> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ id, dto }: UpdateGroupCommand): Promise<GroupResponse> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Grupo no encontrado')
    const entity = await this.repo.update(id, dto)
    return GroupMapper.toResponse(entity)
  }
}
