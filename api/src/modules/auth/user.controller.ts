import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }      from '@nestjs/cqrs'
import { JwtAuthGuard }              from '../../common/guards/jwt-auth.guard'
import { AdminGuard }                from '../../common/guards/admin.guard'
import { ResponseMessage }           from '../../common/decorators/response-message.decorator'
import { GetUsersQuery }             from './application/queries/get-users.query'
import { CreateUserCommand, CreateUserDto } from './application/commands/create-user.command'
import { UpdateUserCommand, UpdateUserDto } from './application/commands/update-user.command'
import { DeleteUserCommand }         from './application/commands/delete-user.command'
import type { UserResponse }         from '@simulador/shared'

@Controller('usuarios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UserController {
  constructor(
    private readonly cb: CommandBus,
    private readonly qb: QueryBus,
  ) {}

  @Get()
  @ResponseMessage('Usuarios obtenidos')
  getAll(): Promise<UserResponse[]> {
    return this.qb.execute(new GetUsersQuery())
  }

  @Post()
  @ResponseMessage('Usuario creado')
  create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    return this.cb.execute(new CreateUserCommand(dto))
  }

  @Patch(':id')
  @ResponseMessage('Usuario actualizado')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponse> {
    return this.cb.execute(new UpdateUserCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Usuario eliminado')
  remove(@Param('id') id: string): Promise<void> {
    return this.cb.execute(new DeleteUserCommand(id))
  }
}
