"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const simulation_controller_1 = require("./simulation.controller");
const get_simulations_query_1 = require("./application/queries/get-simulations.query");
const get_simulation_query_1 = require("./application/queries/get-simulation.query");
const create_simulation_command_1 = require("./application/commands/create-simulation.command");
const update_simulation_command_1 = require("./application/commands/update-simulation.command");
const delete_simulation_command_1 = require("./application/commands/delete-simulation.command");
const simulation_repository_1 = require("./domain/simulation.repository");
const simulation_repository_impl_1 = require("./infrastructure/simulation.repository.impl");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let SimulationModule = class SimulationModule {
};
exports.SimulationModule = SimulationModule;
exports.SimulationModule = SimulationModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [simulation_controller_1.SimulationController],
        providers: [
            prisma_service_1.PrismaService,
            get_simulations_query_1.GetSimulationsHandler, get_simulation_query_1.GetSimulationHandler,
            create_simulation_command_1.CreateSimulationHandler, update_simulation_command_1.UpdateSimulationHandler, delete_simulation_command_1.DeleteSimulationHandler,
            { provide: simulation_repository_1.SimulationRepository, useClass: simulation_repository_impl_1.SimulationRepositoryImpl },
        ],
    })
], SimulationModule);
//# sourceMappingURL=simulation.module.js.map