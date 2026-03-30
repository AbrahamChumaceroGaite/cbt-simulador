import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }                                         from '@nestjs/cqrs'
import { GetGroupsQuery }                                               from './application/queries/get-groups.query'
import { GetGroupQuery }                                                from './application/queries/get-group.query'
import { CreateGroupCommand, CreateGroupDto }                          from './application/commands/create-group.command'
import { UpdateGroupCommand, UpdateGroupDto }                          from './application/commands/update-group.command'
import { DeleteGroupCommand }                                           from './application/commands/delete-group.command'
import { JwtAuthGuard }                                                 from '../../common/guards/jwt-auth.guard'
import { AdminGuard }                                                   from '../../common/guards/admin.guard'
import { ResponseMessage }                                              from '../../common/decorators/response-message.decorator'
import type { GroupResponse }                                           from '@simulador/shared'

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  @UseGuards(AdminGuard)
  @ResponseMessage('Grupos obtenidos')
  getAll(): Promise<GroupResponse[]> {
    return this.qb.execute(new GetGroupsQuery())
  }

  @Get(':id')
  @ResponseMessage('Grupo obtenido')
  getOne(@Param('id') id: string): Promise<GroupResponse> {
    return this.qb.execute(new GetGroupQuery(id))
  }

  @Post()
  @UseGuards(AdminGuard)
  @ResponseMessage('Grupo creado')
  create(@Body() dto: CreateGroupDto): Promise<GroupResponse> {
    return this.cb.execute(new CreateGroupCommand(dto))
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ResponseMessage('Grupo actualizado')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto): Promise<GroupResponse> {
    return this.cb.execute(new UpdateGroupCommand(id, dto))
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ResponseMessage('Grupo eliminado')
  remove(@Param('id') id: string): Promise<void> {
    return this.cb.execute(new DeleteGroupCommand(id))
  }
}
