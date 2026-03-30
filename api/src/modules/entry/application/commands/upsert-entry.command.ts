import { ICommandHandler, CommandHandler }          from '@nestjs/cqrs'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { EntryRepository }                           from '../../domain/entry.repository'
import { EntryMapper }                               from '../entry.mapper'
import type { EntryResponse }                        from '@simulador/shared'

export class UpsertEntryDto {
  @IsString()   @IsNotEmpty()  simulationId!:  string
  @IsNumber()                  sessionNum!:    number
  @IsOptional() @IsString()    date?:          string
  @IsOptional() @IsNumber()    myPrediction?:  number | null
  @IsOptional() @IsNumber()    realHeight?:    number | null
  @IsOptional() @IsNumber()    temperature?:   number | null
  @IsOptional() @IsNumber()    humidity?:      number | null
  @IsOptional() @IsNumber()    lightHours?:    number | null
  @IsOptional() @IsString()    note?:          string
}

export class UpsertEntryCommand {
  constructor(public readonly dto: UpsertEntryDto) {}
}

@CommandHandler(UpsertEntryCommand)
export class UpsertEntryHandler implements ICommandHandler<UpsertEntryCommand, EntryResponse> {
  constructor(private readonly repo: EntryRepository) {}

  async execute({ dto }: UpsertEntryCommand): Promise<EntryResponse> {
    const entity = await this.repo.upsert(dto)
    return EntryMapper.toResponse(entity)
  }
}
