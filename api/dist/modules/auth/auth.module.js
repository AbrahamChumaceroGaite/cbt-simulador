"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const auth_controller_1 = require("./auth.controller");
const user_controller_1 = require("./user.controller");
const login_command_1 = require("./application/commands/login.command");
const get_users_query_1 = require("./application/queries/get-users.query");
const create_user_command_1 = require("./application/commands/create-user.command");
const update_user_command_1 = require("./application/commands/update-user.command");
const delete_user_command_1 = require("./application/commands/delete-user.command");
const user_repository_1 = require("./domain/user.repository");
const user_repository_impl_1 = require("./infrastructure/user.repository.impl");
const group_repository_1 = require("../group/domain/group.repository");
const group_repository_impl_1 = require("../group/infrastructure/group.repository.impl");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [auth_controller_1.AuthController, user_controller_1.UserController],
        providers: [
            prisma_service_1.PrismaService,
            login_command_1.LoginHandler,
            get_users_query_1.GetUsersHandler,
            create_user_command_1.CreateUserHandler,
            update_user_command_1.UpdateUserHandler,
            delete_user_command_1.DeleteUserHandler,
            { provide: user_repository_1.UserRepository, useClass: user_repository_impl_1.UserRepositoryImpl },
            { provide: group_repository_1.GroupRepository, useClass: group_repository_impl_1.GroupRepositoryImpl },
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map