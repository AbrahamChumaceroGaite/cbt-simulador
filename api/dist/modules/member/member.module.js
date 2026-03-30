"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const member_controller_1 = require("./member.controller");
const get_members_query_1 = require("./application/queries/get-members.query");
const create_member_command_1 = require("./application/commands/create-member.command");
const update_member_command_1 = require("./application/commands/update-member.command");
const delete_member_command_1 = require("./application/commands/delete-member.command");
const member_repository_1 = require("./domain/member.repository");
const member_repository_impl_1 = require("./infrastructure/member.repository.impl");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let MemberModule = class MemberModule {
};
exports.MemberModule = MemberModule;
exports.MemberModule = MemberModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [member_controller_1.MemberController],
        providers: [
            prisma_service_1.PrismaService,
            get_members_query_1.GetMembersHandler,
            create_member_command_1.CreateMemberHandler, update_member_command_1.UpdateMemberHandler, delete_member_command_1.DeleteMemberHandler,
            { provide: member_repository_1.MemberRepository, useClass: member_repository_impl_1.MemberRepositoryImpl },
        ],
    })
], MemberModule);
//# sourceMappingURL=member.module.js.map