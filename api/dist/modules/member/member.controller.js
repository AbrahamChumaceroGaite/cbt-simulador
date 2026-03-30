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
exports.MemberController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const get_members_query_1 = require("./application/queries/get-members.query");
const create_member_command_1 = require("./application/commands/create-member.command");
const update_member_command_1 = require("./application/commands/update-member.command");
const delete_member_command_1 = require("./application/commands/delete-member.command");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const response_message_decorator_1 = require("../../common/decorators/response-message.decorator");
let MemberController = class MemberController {
    constructor(qb, cb) {
        this.qb = qb;
        this.cb = cb;
    }
    getByGroup(groupId) {
        return this.qb.execute(new get_members_query_1.GetMembersQuery(groupId));
    }
    create(dto) {
        return this.cb.execute(new create_member_command_1.CreateMemberCommand(dto));
    }
    update(id, dto) {
        return this.cb.execute(new update_member_command_1.UpdateMemberCommand(id, dto));
    }
    remove(id) {
        return this.cb.execute(new delete_member_command_1.DeleteMemberCommand(id));
    }
};
exports.MemberController = MemberController;
__decorate([
    (0, common_1.Get)('by-group/:groupId'),
    (0, response_message_decorator_1.ResponseMessage)('Integrantes obtenidos'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "getByGroup", null);
__decorate([
    (0, common_1.Post)(),
    (0, response_message_decorator_1.ResponseMessage)('Integrante agregado'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_member_command_1.CreateMemberDto]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Integrante actualizado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_member_command_1.UpdateMemberDto]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Integrante eliminado'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "remove", null);
exports.MemberController = MemberController = __decorate([
    (0, common_1.Controller)('members'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.QueryBus, cqrs_1.CommandBus])
], MemberController);
//# sourceMappingURL=member.controller.js.map