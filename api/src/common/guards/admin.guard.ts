import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import type { SessionPayload } from '@simulador/shared'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user: SessionPayload = ctx.switchToHttp().getRequest().user
    if (user?.role !== 'admin') throw new ForbiddenException('Solo administradores')
    return true
  }
}
