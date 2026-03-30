"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const get_groups_query_1 = require("./application/queries/get-groups.query");
const get_group_query_1 = require("./application/queries/get-group.query");
const create_group_command_1 = require("./application/commands/create-group.command");
const update_group_command_1 = require("./application/commands/update-group.command");
const delete_group_command_1 = require("./application/commands/delete-group.command");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
const response_message_decorator_1 = require("../../common/decorators/response-message.decorator");
let GroupController = class GroupController {
    constructor(qb, cb) {
        this.qb = qb;
        this.cb = cb;
    }
    getAll() {
        return this.qb.execute(new get_groups_query_1.GetGroupsQuery());
    }
    getOne(id) {
        return this.qb.execute(new get_group_query_1.GetGroupQuery(id));
    }
    create(dto) {
        return this.cb.execute(new create_group_command_1.CreateGroupCommand(dto));
    }
    update(id, dto) {
        return this.cb.execute(new update_group_command_1.UpdateGroupCommand(id, dto));
    }
    remove(id) {
        return this.cb.execute(new delete_group_command_1.DeleteGroupCommand(id));
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, response_message_decorator_1.ResponseMessage)('Grupos obtenidos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Grupo obtenido'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, response_message_decorator_1.ResponseMessage)('Grupo creado'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_command_1.CreateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, response_message_decorator_1.ResponseMessage)('Grupo actualizado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_command_1.UpdateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, response_message_decorator_1.ResponseMessage)('Grupo eliminado'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "remove", null);
exports.GroupController = GroupController = __decorate([
    (0, common_1.Controller)('groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.QueryBus, cqrs_1.CommandBus])
], GroupController);
//# sourceMappingURL=group.controller.js.map