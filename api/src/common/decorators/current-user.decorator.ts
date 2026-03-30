import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { SessionPayload } from '@simulador/shared'

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SessionPayload =>
    ctx.switchToHttp().getRequest().user,
)
