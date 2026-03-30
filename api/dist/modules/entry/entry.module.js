"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const entry_controller_1 = require("./entry.controller");
const get_entries_query_1 = require("./application/queries/get-entries.query");
const upsert_entry_command_1 = require("./application/commands/upsert-entry.command");
const entry_repository_1 = require("./domain/entry.repository");
const entry_repository_impl_1 = require("./infrastructure/entry.repository.impl");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let EntryModule = class EntryModule {
};
exports.EntryModule = EntryModule;
exports.EntryModule = EntryModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [entry_controller_1.EntryController],
        providers: [
            prisma_service_1.PrismaService,
            get_entries_query_1.GetEntriesHandler, upsert_entry_command_1.UpsertEntryHandler,
            { provide: entry_repository_1.EntryRepository, useClass: entry_repository_impl_1.EntryRepositoryImpl },
        ],
    })
], EntryModule);
//# sourceMappingURL=entry.module.js.map