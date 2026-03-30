import { Module }           from '@nestjs/common'
import { ClimateService }   from './climate.service'
import { ClimateController } from './climate.controller'

@Module({
  providers:   [ClimateService],
  controllers: [ClimateController],
})
export class ClimateModule {}
