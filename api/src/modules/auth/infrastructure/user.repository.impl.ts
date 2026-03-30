import { Injectable }    from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { UserRepository } from '../domain/user.repository'
import type { UserEntity } from '../domain/user.entity'

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findByCode(code: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { code: code.toLowerCase() } }) as unknown as Promise<UserEntity | null>
  }
}
