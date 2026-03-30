import { ICommandHandler, CommandHandler }  from '@nestjs/cqrs'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { UnauthorizedException }            from '@nestjs/common'
import { SignJWT }                          from 'jose'
import * as bcrypt                          from 'bcryptjs'
import { UserRepository }                   from '../../domain/user.repository'
import { GroupRepository }                  from '../../../group/domain/group.repository'
import type { SessionPayload }              from '@simulador/shared'

const SECRET    = new TextEncoder().encode(process.env.JWT_SECRET ?? 'cbt-plants-dev-secret')
export const COOKIE_NAME = 'cbt_plants_session'

async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET)
}

export class LoginDto {
  @IsString()   @IsNotEmpty() code!:      string
  @IsOptional() @IsString()   password?:  string
  @IsOptional() @IsString()   mode?:      string
}

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, { token: string; user: SessionPayload }> {
  constructor(
    private readonly userRepo:  UserRepository,
    private readonly groupRepo: GroupRepository,
  ) {}

  async execute({ dto }: LoginCommand): Promise<{ token: string; user: SessionPayload }> {
    const normalizedCode = dto.code.trim().toUpperCase()

    if (dto.mode === 'admin') {
      const user = await this.userRepo.findByCode(normalizedCode.toLowerCase())
      if (!user || !user.isActive || user.role !== 'admin') {
        throw new UnauthorizedException('Credenciales inválidas')
      }
      if (!dto.password) throw new UnauthorizedException('Contraseña requerida')
      const valid = await bcrypt.compare(dto.password, user.passwordHash)
      if (!valid) throw new UnauthorizedException('Credenciales inválidas')

      const payload: SessionPayload = { userId: user.id, role: 'admin', code: user.code, fullName: user.fullName }
      const token = await signToken(payload)
      return { token, user: payload }
    }

    // Group login — code is sole credential
    const group = await this.groupRepo.findByCode(normalizedCode)
    if (!group) throw new UnauthorizedException('Código de grupo no encontrado')

    const payload: SessionPayload = { userId: group.id, role: 'group', groupId: group.id, code: group.code, fullName: group.name }
    const token = await signToken(payload)
    return { token, user: payload }
  }
}
