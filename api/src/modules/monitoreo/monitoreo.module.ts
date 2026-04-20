import { Module }             from '@nestjs/common'
import { MonitoreoService }   from './monitoreo.service'
import { MonitoreoController } from './monitoreo.controller'
import { PrismaService }      from '../../infrastructure/prisma/prisma.service'
import { SocketModule }       from '../../infrastructure/socket/socket.module'

@Module({
  imports:     [SocketModule],
  providers:   [MonitoreoService, PrismaService],
  controllers: [MonitoreoController],
})
export class MonitoreoModule {}
