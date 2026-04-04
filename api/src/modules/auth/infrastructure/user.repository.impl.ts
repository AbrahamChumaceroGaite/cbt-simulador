import { Injectable }    from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { UserRepository } from '../domain/user.repository'
import type { UserEntity } from '../domain/user.entity'

type CreateData = Omit<UserEntity, 'id' | 'createdAt'> & { id?: string }
type UpdateData = Partial<Pick<UserEntity, 'fullName' | 'passwordHash' | 'isActive'>>

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findAll(): Promise<UserEntity[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } }) as unknown as Promise<UserEntity[]>
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } }) as unknown as Promise<UserEntity | null>
  }

  findByCode(code: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { code: code.toLowerCase() } }) as unknown as Promise<UserEntity | null>
  }

  create(data: CreateData): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        code:         data.code.toLowerCase(),
        passwordHash: data.passwordHash,
        role:         data.role,
        fullName:     data.fullName,
        isActive:     data.isActive ?? true,
      },
    }) as unknown as Promise<UserEntity>
  }

  update(id: string, data: UpdateData): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data }) as unknown as Promise<UserEntity>
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }
}
