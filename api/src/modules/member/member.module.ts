import { Module }               from '@nestjs/common'
import { CqrsModule }           from '@nestjs/cqrs'
import { MemberController }     from './member.controller'
import { GetMembersHandler }    from './application/queries/get-members.query'
import { CreateMemberHandler }  from './application/commands/create-member.command'
import { UpdateMemberHandler }  from './application/commands/update-member.command'
import { DeleteMemberHandler }  from './application/commands/delete-member.command'
import { MemberRepository }     from './domain/member.repository'
import { MemberRepositoryImpl } from './infrastructure/member.repository.impl'
import { PrismaService }        from '../../infrastructure/prisma/prisma.service'

@Module({
  imports:     [CqrsModule],
  controllers: [MemberController],
  providers:   [
    PrismaService,
    GetMembersHandler,
    CreateMemberHandler, UpdateMemberHandler, DeleteMemberHandler,
    { provide: MemberRepository, useClass: MemberRepositoryImpl },
  ],
})
export class MemberModule {}
