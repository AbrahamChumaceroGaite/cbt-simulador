import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { NotFoundException }               from '@nestjs/common'
import * as bcrypt                         from 'bcryptjs'
import { UserRepository }                  from '../../domain/user.repository'
import type { UserResponse, PlantasRole }  from '@simulador/shared'

export class UpdateUserDto {
  @IsOptional() @IsString()  fullName?: string
  @IsOptional() @IsString()  password?: string
  @IsOptional() @IsBoolean() isActive?: boolean
}

export class UpdateUserCommand {
  constructor(public readonly id: string, public readonly dto: UpdateUserDto) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserResponse> {
  constructor(private readonly repo: UserRepository) {}

  async execute({ id, dto }: UpdateUserCommand): Promise<UserResponse> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Usuario no encontrado')

    const data: { fullName?: string; passwordHash?: string; isActive?: boolean } = {}
    if (dto.fullName !== undefined) data.fullName     = dto.fullName
    if (dto.password !== undefined) data.passwordHash = await bcrypt.hash(dto.password, 10)
    if (dto.isActive !== undefined) data.isActive     = dto.isActive

    const user = await this.repo.update(id, data)
    return {
      id:        user.id,
      code:      user.code,
      role:      user.role as PlantasRole,
      fullName:  user.fullName,
      isActive:  user.isActive,
      createdAt: user.createdAt.toISOString(),
    }
  }
}
