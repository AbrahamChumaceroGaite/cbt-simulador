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
exports.ClimateController = void 0;
const common_1 = require("@nestjs/common");
const climate_service_1 = require("./climate.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const response_message_decorator_1 = require("../../common/decorators/response-message.decorator");
let ClimateController = class ClimateController {
    constructor(svc) {
        this.svc = svc;
    }
    getClimate(month, year) {
        const m = Math.max(1, Math.min(12, parseInt(month ?? '4')));
        const y = parseInt(year ?? String(new Date().getFullYear()));
        return this.svc.getClimate(m, y);
    }
};
exports.ClimateController = ClimateController;
__decorate([
    (0, common_1.Get)(),
    (0, response_message_decorator_1.ResponseMessage)('Clima obtenido'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ClimateController.prototype, "getClimate", null);
exports.ClimateController = ClimateController = __decorate([
    (0, common_1.Controller)('climate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [climate_service_1.ClimateService])
], ClimateController);
//# sourceMappingURL=climate.controller.js.map