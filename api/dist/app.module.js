"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const cqrs_1 = require("@nestjs/cqrs");
const core_1 = require("@nestjs/core");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const auth_module_1 = require("./modules/auth/auth.module");
const group_module_1 = require("./modules/group/group.module");
const member_module_1 = require("./modules/member/member.module");
const simulation_module_1 = require("./modules/simulation/simulation.module");
const entry_module_1 = require("./modules/entry/entry.module");
const climate_module_1 = require("./modules/climate/climate.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const backup_module_1 = require("./modules/backup/backup.module");
const socket_module_1 = require("./infrastructure/socket/socket.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            cqrs_1.CqrsModule.forRoot(),
            auth_module_1.AuthModule, group_module_1.GroupModule, member_module_1.MemberModule, simulation_module_1.SimulationModule,
            entry_module_1.EntryModule, climate_module_1.ClimateModule, analytics_module_1.AnalyticsModule, backup_module_1.BackupModule,
            socket_module_1.SocketModule,
        ],
        providers: [{ provide: core_1.APP_INTERCEPTOR, useClass: transform_interceptor_1.TransformInterceptor }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map