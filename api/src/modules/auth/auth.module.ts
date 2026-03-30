import { Module }              from '@nestjs/common'
import { CqrsModule }          from '@nestjs/cqrs'
import { AuthController }      from './auth.controller'
import { LoginHandler }        from './application/commands/login.command'
import { UserRepository }      from './domain/user.repository'
import { UserRepositoryImpl }  from './infrastructure/user.repository.impl'
import { GroupRepository }     from '../group/domain/group.repository'
import { GroupRepositoryImpl } from '../group/infrastructure/group.repository.impl'
import { PrismaService }       from '../../infrastructure/prisma/prisma.service'

@Module({
  imports:     [CqrsModule],
  controllers: [AuthController],
  providers:   [
    PrismaService,
    LoginHandler,
    { provide: UserRepository,  useClass: UserRepositoryImpl },
    { provide: GroupRepository, useClass: GroupRepositoryImpl },
  ],
})
export class AuthModule {}
