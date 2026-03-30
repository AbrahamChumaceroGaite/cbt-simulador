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
exports.SimulationController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const get_simulations_query_1 = require("./application/queries/get-simulations.query");
const get_simulation_query_1 = require("./application/queries/get-simulation.query");
const create_simulation_command_1 = require("./application/commands/create-simulation.command");
const update_simulation_command_1 = require("./application/commands/update-simulation.command");
const delete_simulation_command_1 = require("./application/commands/delete-simulation.command");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const response_message_decorator_1 = require("../../common/decorators/response-message.decorator");
let SimulationController = class SimulationController {
    constructor(qb, cb) {
        this.qb = qb;
        this.cb = cb;
    }
    getAll(groupId) {
        return this.qb.execute(new get_simulations_query_1.GetSimulationsQuery(groupId));
    }
    getOne(id) {
        return this.qb.execute(new get_simulation_query_1.GetSimulationQuery(id));
    }
    create(dto) {
        return this.cb.execute(new create_simulation_command_1.CreateSimulationCommand(dto));
    }
    update(id, dto) {
        return this.cb.execute(new update_simulation_command_1.UpdateSimulationCommand(id, dto));
    }
    remove(id) {
        return this.cb.execute(new delete_simulation_command_1.DeleteSimulationCommand(id));
    }
};
exports.SimulationController = SimulationController;
__decorate([
    (0, common_1.Get)(),
    (0, response_message_decorator_1.ResponseMessage)('Simulaciones obtenidas'),
    __param(0, (0, common_1.Query)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Simulación obtenida'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, response_message_decorator_1.ResponseMessage)('Simulación creada'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_simulation_command_1.CreateSimulationDto]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Simulación actualizada'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_simulation_command_1.UpdateSimulationDto]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, response_message_decorator_1.ResponseMessage)('Simulación eliminada'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SimulationController.prototype, "remove", null);
exports.SimulationController = SimulationController = __decorate([
    (0, common_1.Controller)('simulations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.QueryBus, cqrs_1.CommandBus])
], SimulationController);
//# sourceMappingURL=simulation.controller.js.map