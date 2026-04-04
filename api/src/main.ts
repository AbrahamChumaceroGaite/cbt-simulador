import 'reflect-metadata'
import { NestFactory }           from '@nestjs/core'
import { ValidationPipe }        from '@nestjs/common'
import { WsAdapter }             from '@nestjs/platform-ws'
import { AppModule }             from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useWebSocketAdapter(new WsAdapter(app))
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3002', credentials: true })
  await app.listen(process.env.PORT ?? 4002)
  console.log(`Simulador API running on port ${process.env.PORT ?? 4002}`)
}
bootstrap()
