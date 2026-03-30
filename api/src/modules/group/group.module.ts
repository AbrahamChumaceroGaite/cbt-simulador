import { Module }              from '@nestjs/common'
import { CqrsModule }          from '@nestjs/cqrs'
import { GroupController }     from './group.controller'
import { GetGroupsHandler }    from './application/queries/get-groups.query'
import { GetGroupHandler }     from './application/queries/get-group.query'
import { CreateGroupHandler }  from './application/commands/create-group.command'
import { UpdateGroupHandler }  from './application/commands/update-group.command'
import { DeleteGroupHandler }  from './application/commands/delete-group.command'
import { GroupRepository }     from './domain/group.repository'
import { GroupRepositoryImpl } from './infrastructure/group.repository.impl'
import { PrismaService }       from '../../infrastructure/prisma/prisma.service'

@Module({
  imports:     [CqrsModule],
  controllers: [GroupController],
  providers:   [
    PrismaService,
    GetGroupsHandler, GetGroupHandler,
    CreateGroupHandler, UpdateGroupHandler, DeleteGroupHandler,
    { provide: GroupRepository, useClass: GroupRepositoryImpl },
  ],
  exports: [GroupRepository],
})
export class GroupModule {}
