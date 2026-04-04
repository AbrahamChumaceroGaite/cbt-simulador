import { Logger }                                    from '@nestjs/common'
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { WebSocket }                                 from 'ws'
import { IncomingMessage }                           from 'http'
import { jwtVerify }                                 from 'jose'
import { SocketService }                             from './socket.service'
import type { SessionPayload }                       from '@simulador/shared'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'cbt-plants-dev-secret')

@WebSocketGateway({ path: '/ws' })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsGateway.name)

  constructor(private readonly sockets: SocketService) {}

  async handleConnection(client: WebSocket, req: IncomingMessage): Promise<void> {
    const ip = req.socket.remoteAddress ?? 'unknown'
    this.logger.log(`[connect] ${ip}  cookie=${!!req.headers.cookie}`)

    const session = await this.#auth(req)
    if (!session) {
      this.logger.warn(`[connect] UNAUTHORIZED — closing 1008`)
      client.close(1008, 'Unauthorized')
      return
    }

    if (session.role === 'admin') {
      this.sockets.register('admin', session.userId, client)
      this.logger.log(`[connect] admin userId=${session.userId}`)
    } else if (session.role === 'group' && session.groupId) {
      this.sockets.register('group', session.groupId, client)
      this.logger.log(`[connect] group groupId=${session.groupId}`)
    } else {
      this.logger.warn(`[connect] unknown role=${session.role} — closing`)
      client.close(1008, 'Unauthorized')
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.sockets.unregister(client)
  }

  async #auth(req: IncomingMessage): Promise<SessionPayload | null> {
    const cookie = req.headers.cookie ?? ''
    const match  = cookie.match(/(?:^|;\s*)cbt_plants_session=([^;]+)/)
    const token  = match?.[1]
    if (!token) return null
    try {
      const { payload } = await jwtVerify(token, SECRET)
      return payload as unknown as SessionPayload
    } catch (err) {
      this.logger.warn(`[auth] JWT verify failed: ${(err as Error).message}`)
      return null
    }
  }
}
