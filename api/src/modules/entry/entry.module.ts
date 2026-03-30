import { Module }              from '@nestjs/common'
import { CqrsModule }          from '@nestjs/cqrs'
import { EntryController }     from './entry.controller'
import { GetEntriesHandler }   from './application/queries/get-entries.query'
import { UpsertEntryHandler }  from './application/commands/upsert-entry.command'
import { EntryRepository }     from './domain/entry.repository'
import { EntryRepositoryImpl } from './infrastructure/entry.repository.impl'
import { PrismaService }       from '../../infrastructure/prisma/prisma.service'

@Module({
  imports:     [CqrsModule],
  controllers: [EntryController],
  providers:   [
    PrismaService,
    GetEntriesHandler, UpsertEntryHandler,
    { provide: EntryRepository, useClass: EntryRepositoryImpl },
  ],
})
export class EntryModule {}
