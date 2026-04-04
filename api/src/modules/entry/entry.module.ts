import { Module }                   from '@nestjs/common'
import { CqrsModule }               from '@nestjs/cqrs'
import { EntryController }          from './entry.controller'
import { GetEntriesHandler }        from './application/queries/get-entries.query'
import { UpsertEntryHandler }       from './application/commands/upsert-entry.command'
import { DeleteEntryHandler }       from './application/commands/delete-entry.command'
import { EntryRepository }          from './domain/entry.repository'
import { EntryRepositoryImpl }      from './infrastructure/entry.repository.impl'
import { PrismaService }            from '../../infrastructure/prisma/prisma.service'
import { SocketModule }             from '../../infrastructure/socket/socket.module'
import { SimulationRepository }     from '../simulation/domain/simulation.repository'
import { SimulationRepositoryImpl } from '../simulation/infrastructure/simulation.repository.impl'

@Module({
  imports:     [CqrsModule, SocketModule],
  controllers: [EntryController],
  providers:   [
    PrismaService,
    GetEntriesHandler, UpsertEntryHandler, DeleteEntryHandler,
    { provide: EntryRepository,      useClass: EntryRepositoryImpl },
    { provide: SimulationRepository, useClass: SimulationRepositoryImpl },
  ],
})
export class EntryModule {}
