import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }                                         from '@nestjs/cqrs'
import { GetMembersQuery }                                              from './application/queries/get-members.query'
import { CreateMemberCommand, CreateMemberDto }                        from './application/commands/create-member.command'
import { UpdateMemberCommand, UpdateMemberDto }                        from './application/commands/update-member.command'
import { DeleteMemberCommand }                                          from './application/commands/delete-member.command'
import { JwtAuthGuard }                                                 from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }                                              from '../../common/decorators/response-message.decorator'
import type { MemberResponse }                                          from '@simulador/shared'

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get('by-group/:groupId')
  @ResponseMessage('Integrantes obtenidos')
  getByGroup(@Param('groupId') groupId: string): Promise<MemberResponse[]> {
    return this.qb.execute(new GetMembersQuery(groupId))
  }

  @Post()
  @ResponseMessage('Integrante agregado')
  create(@Body() dto: CreateMemberDto): Promise<MemberResponse> {
    return this.cb.execute(new CreateMemberCommand(dto))
  }

  @Put(':id')
  @ResponseMessage('Integrante actualizado')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto): Promise<MemberResponse> {
    return this.cb.execute(new UpdateMemberCommand(id, dto))
  }

  @Delete(':id')
  @ResponseMessage('Integrante eliminado')
  remove(@Param('id') id: string): Promise<void> {
    return this.cb.execute(new DeleteMemberCommand(id))
  }
}
