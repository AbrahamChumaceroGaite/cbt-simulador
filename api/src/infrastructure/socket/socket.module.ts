import { Module }        from '@nestjs/common'
import { SocketService } from './socket.service'
import { WsGateway }     from './ws.gateway'

@Module({
  providers: [SocketService, WsGateway],
  exports:   [SocketService],
})
export class SocketModule {}
