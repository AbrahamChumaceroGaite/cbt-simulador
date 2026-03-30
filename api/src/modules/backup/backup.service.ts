import { Injectable }  from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  async export(): Promise<object> {
    const groups = await this.prisma.group.findMany({
      include: {
        members:     { orderBy: { name: 'asc' } },
        simulations: {
          include: { entries: { orderBy: { sessionNum: 'asc' } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { course: 'asc' },
    })

    return {
      version:    1,
      exportedAt: new Date().toISOString(),
      groups,
    }
  }
}
