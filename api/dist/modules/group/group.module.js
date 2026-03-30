"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const group_controller_1 = require("./group.controller");
const get_groups_query_1 = require("./application/queries/get-groups.query");
const get_group_query_1 = require("./application/queries/get-group.query");
const create_group_command_1 = require("./application/commands/create-group.command");
const update_group_command_1 = require("./application/commands/update-group.command");
const delete_group_command_1 = require("./application/commands/delete-group.command");
const group_repository_1 = require("./domain/group.repository");
const group_repository_impl_1 = require("./infrastructure/group.repository.impl");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let GroupModule = class GroupModule {
};
exports.GroupModule = GroupModule;
exports.GroupModule = GroupModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [group_controller_1.GroupController],
        providers: [
            prisma_service_1.PrismaService,
            get_groups_query_1.GetGroupsHandler, get_group_query_1.GetGroupHandler,
            create_group_command_1.CreateGroupHandler, update_group_command_1.UpdateGroupHandler, delete_group_command_1.DeleteGroupHandler,
            { provide: group_repository_1.GroupRepository, useClass: group_repository_impl_1.GroupRepositoryImpl },
        ],
        exports: [group_repository_1.GroupRepository],
    })
], GroupModule);
//# sourceMappingURL=group.module.js.map