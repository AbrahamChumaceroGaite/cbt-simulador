import { ICommandHandler, CommandHandler }          from '@nestjs/cqrs'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { SimulationRepository }                     from '../../domain/simulation.repository'
import { SimulationMapper }                         from '../simulation.mapper'
import type { SimulationResponse }                  from '@simulador/shared'

export class CreateSimulationDto {
  @IsString()   @IsNotEmpty()  groupId!:         string
  @IsString()   @IsNotEmpty()  name!:            string
  @IsOptional() @IsString()    description?:     string
  @IsOptional() @IsString()    plantName?:       string
  @IsOptional() @IsNumber()    initialHeight?:   number
  @IsOptional() @IsNumber()    baseGrowth?:      number
  @IsOptional() @IsNumber()    optimalTemp?:     number
  @IsOptional() @IsNumber()    optimalHumidity?: number
  @IsOptional() @IsNumber()    optimalLight?:    number
}

export class CreateSimulationCommand {
  constructor(public readonly dto: CreateSimulationDto) {}
}

@CommandHandler(CreateSimulationCommand)
export class CreateSimulationHandler implements ICommandHandler<CreateSimulationCommand, SimulationResponse> {
  constructor(private readonly repo: SimulationRepository) {}

  async execute({ dto }: CreateSimulationCommand): Promise<SimulationResponse> {
    const entity = await this.repo.create(dto)
    return SimulationMapper.toResponse(entity)
  }
}
