import 'reflect-metadata'
import { Module }          from '@nestjs/common'
import { AppController }   from './app.controller'
import { CqrsModule }      from '@nestjs/cqrs'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { AuthModule }       from './modules/auth/auth.module'
import { GroupModule }      from './modules/group/group.module'
import { MemberModule }     from './modules/member/member.module'
import { SimulationModule } from './modules/simulation/simulation.module'
import { EntryModule }      from './modules/entry/entry.module'
import { ClimateModule }    from './modules/climate/climate.module'
import { AnalyticsModule }  from './modules/analytics/analytics.module'
import { BackupModule }     from './modules/backup/backup.module'
import { SocketModule }    from './infrastructure/socket/socket.module'

@Module({
  controllers: [AppController],
  imports: [
    CqrsModule.forRoot(),
    AuthModule, GroupModule, MemberModule, SimulationModule,
    EntryModule, ClimateModule, AnalyticsModule, BackupModule,
    SocketModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: TransformInterceptor }],
})
export class AppModule {}
