import { ICommandHandler, CommandHandler }                    from '@nestjs/cqrs'
import { IsBoolean, IsNumber, IsOptional, IsString }          from 'class-validator'
import { NotFoundException }                                   from '@nestjs/common'
import { SimulationRepository }                               from '../../domain/simulation.repository'
import { SimulationMapper }                                   from '../simulation.mapper'
import type { SimulationResponse }                            from '@simulador/shared'

export class UpdateSimulationDto {
  @IsOptional() @IsString()  name?:               string
  @IsOptional() @IsString()  description?:        string
  @IsOptional() @IsString()  plantName?:          string
  @IsOptional() @IsBoolean() isLocked?:           boolean
  @IsOptional() @IsNumber()  initialHeight?:      number
  @IsOptional() @IsNumber()  baseGrowth?:         number
  @IsOptional() @IsNumber()  optimalTemp?:        number
  @IsOptional() @IsNumber()  optimalHumidity?:    number
  @IsOptional() @IsNumber()  optimalLight?:       number
  @IsOptional() @IsNumber()  officialPrediction?: number | null
  @IsOptional() @IsString()  predictionNote?:     string
  @IsOptional() @IsNumber()  startMonth?:         number
  @IsOptional() @IsNumber()  startYear?:          number
  @IsOptional() @IsNumber()  startDay?:           number
  @IsOptional() @IsNumber()  projDays?:           number
}

export class UpdateSimulationCommand {
  constructor(public readonly id: string, public readonly dto: UpdateSimulationDto) {}
}

@CommandHandler(UpdateSimulationCommand)
export class UpdateSimulationHandler implements ICommandHandler<UpdateSimulationCommand, SimulationResponse> {
  constructor(private readonly repo: SimulationRepository) {}

  async execute({ id, dto }: UpdateSimulationCommand): Promise<SimulationResponse> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Simulación no encontrada')
    const entity = await this.repo.update(id, dto)
    return SimulationMapper.toResponse(entity)
  }
}
