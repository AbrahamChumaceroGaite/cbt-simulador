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
exports.EntryController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const get_entries_query_1 = require("./application/queries/get-entries.query");
const upsert_entry_command_1 = require("./application/commands/upsert-entry.command");
const delete_entry_command_1 = require("./application/commands/delete-entry.command");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
const response_message_decorator_1 = require("../../common/decorators/response-message.decorator");
let EntryController = class EntryController {
    constructor(qb, cb) {
        this.qb = qb;
        this.cb = cb;
    }
    getBySimulation(simId) {
        return this.qb.execute(new get_entries_query_1.GetEntriesQuery(simId));
    }
    upsert(dto) {
        return this.cb.execute(new upsert_entry_command_1.UpsertEntryCommand(dto));
    }
    remove(id) {
        return this.cb.execute(new delete_entry_command_1.DeleteEntryCommand(id));
    }
};
exports.EntryController = EntryController;
__decorate([
    (0, common_1.Get)('by-simulation/:simId'),
    (0, response_message_decorator_1.ResponseMessage)('Mediciones obtenidas'),
    __param(0, (0, common_1.Param)('simId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "getBySimulation", null);
__decorate([
    (0, common_1.Post)(),
    (0, response_message_decorator_1.ResponseMessage)('Medición guardada'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_entry_command_1.UpsertEntryDto]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, response_message_decorator_1.ResponseMessage)('Sesión eliminada'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntryController.prototype, "remove", null);
exports.EntryController = EntryController = __decorate([
    (0, common_1.Controller)('entries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.QueryBus, cqrs_1.CommandBus])
], EntryController);
//# sourceMappingURL=entry.controller.js.map