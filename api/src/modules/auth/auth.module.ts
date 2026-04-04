import { Module }              from '@nestjs/common'
import { CqrsModule }          from '@nestjs/cqrs'
import { AuthController }      from './auth.controller'
import { UserController }      from './user.controller'
import { LoginHandler }        from './application/commands/login.command'
import { GetUsersHandler }     from './application/queries/get-users.query'
import { CreateUserHandler }   from './application/commands/create-user.command'
import { UpdateUserHandler }   from './application/commands/update-user.command'
import { DeleteUserHandler }   from './application/commands/delete-user.command'
import { UserRepository }      from './domain/user.repository'
import { UserRepositoryImpl }  from './infrastructure/user.repository.impl'
import { GroupRepository }     from '../group/domain/group.repository'
import { GroupRepositoryImpl } from '../group/infrastructure/group.repository.impl'
import { PrismaService }       from '../../infrastructure/prisma/prisma.service'

@Module({
  imports:     [CqrsModule],
  controllers: [AuthController, UserController],
  providers:   [
    PrismaService,
    LoginHandler,
    GetUsersHandler,
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    { provide: UserRepository,  useClass: UserRepositoryImpl },
    { provide: GroupRepository, useClass: GroupRepositoryImpl },
  ],
})
export class AuthModule {}
