import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common'
import { CommandBus }                                              from '@nestjs/cqrs'
import type { Response }                                          from 'express'
import { LoginCommand, LoginDto, COOKIE_NAME }                    from './application/commands/login.command'
import { JwtAuthGuard }                                           from '../../common/guards/jwt-auth.guard'
import { CurrentUser }                                            from '../../common/decorators/current-user.decorator'
import { ResponseMessage }                                        from '../../common/decorators/response-message.decorator'
import type { SessionPayload }                                    from '@simulador/shared'

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge:   8 * 60 * 60 * 1000,
  path:     '/',
}

@Controller('auth')
export class AuthController {
  constructor(private readonly cb: CommandBus) {}

  @Post('login')
  @HttpCode(200)
  @ResponseMessage('Bienvenido')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cb.execute<LoginCommand, { token: string; user: SessionPayload }>(new LoginCommand(dto))
    res.cookie(COOKIE_NAME, result.token, COOKIE_OPTS)
    return result.user
  }

  @Post('logout')
  @HttpCode(200)
  @ResponseMessage('Sesión cerrada')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' })
    return undefined
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Usuario autenticado')
  me(@CurrentUser() user: SessionPayload) {
    return user
  }
}
