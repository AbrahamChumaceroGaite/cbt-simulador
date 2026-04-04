import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsString, IsIn }      from 'class-validator'
import { ConflictException }               from '@nestjs/common'
import * as bcrypt                         from 'bcryptjs'
import { UserRepository }                  from '../../domain/user.repository'
import type { UserResponse, PlantasRole }  from '@simulador/shared'

export class CreateUserDto {
  @IsString() @IsNotEmpty() code!:     string
  @IsString() @IsNotEmpty() password!: string
  @IsString() @IsNotEmpty() fullName!: string
  @IsIn(['admin', 'group'])  role!:    PlantasRole
}

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserResponse> {
  constructor(private readonly repo: UserRepository) {}

  async execute({ dto }: CreateUserCommand): Promise<UserResponse> {
    const existing = await this.repo.findByCode(dto.code.toLowerCase())
    if (existing) throw new ConflictException(`El código "${dto.code}" ya existe`)

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.repo.create({
      code:         dto.code.toLowerCase(),
      passwordHash,
      role:         dto.role,
      fullName:     dto.fullName,
      isActive:     true,
    })

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
