import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { jwtVerify } from 'jose'
import type { SessionPayload } from '@simulador/shared'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'cbt-plants-dev-secret')

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req    = ctx.switchToHttp().getRequest()
    const cookie = req.headers.cookie ?? ''
    const match  = cookie.match(/cbt_plants_session=([^;]+)/)
    const token  = match?.[1]
    if (!token) throw new UnauthorizedException('No autenticado')
    try {
      const { payload } = await jwtVerify(token, SECRET)
      req.user = payload as unknown as SessionPayload
      return true
    } catch {
      throw new UnauthorizedException('Sesión inválida o expirada')
    }
  }
}
