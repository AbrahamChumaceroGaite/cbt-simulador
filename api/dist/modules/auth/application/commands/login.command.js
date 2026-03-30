"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHandler = exports.LoginCommand = exports.LoginDto = exports.COOKIE_NAME = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const jose_1 = require("jose");
const bcrypt = __importStar(require("bcryptjs"));
const user_repository_1 = require("../../domain/user.repository");
const group_repository_1 = require("../../../group/domain/group.repository");
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'cbt-plants-dev-secret');
exports.COOKIE_NAME = 'cbt_plants_session';
async function signToken(payload) {
    return new jose_1.SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(SECRET);
}
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "mode", void 0);
class LoginCommand {
    constructor(dto) {
        this.dto = dto;
    }
}
exports.LoginCommand = LoginCommand;
let LoginHandler = class LoginHandler {
    constructor(userRepo, groupRepo) {
        this.userRepo = userRepo;
        this.groupRepo = groupRepo;
    }
    async execute({ dto }) {
        const normalizedCode = dto.code.trim().toUpperCase();
        if (dto.mode === 'admin') {
            const user = await this.userRepo.findByCode(normalizedCode.toLowerCase());
            if (!user || !user.isActive || user.role !== 'admin') {
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            }
            if (!dto.password)
                throw new common_1.UnauthorizedException('Contraseña requerida');
            const valid = await bcrypt.compare(dto.password, user.passwordHash);
            if (!valid)
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            const payload = { userId: user.id, role: 'admin', code: user.code, fullName: user.fullName };
            const token = await signToken(payload);
            return { token, user: payload };
        }
        const group = await this.groupRepo.findByCode(normalizedCode);
        if (!group)
            throw new common_1.UnauthorizedException('Código de grupo no encontrado');
        const payload = { userId: group.id, role: 'group', groupId: group.id, code: group.code, fullName: group.name };
        const token = await signToken(payload);
        return { token, user: payload };
    }
};
exports.LoginHandler = LoginHandler;
exports.LoginHandler = LoginHandler = __decorate([
    (0, cqrs_1.CommandHandler)(LoginCommand),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        group_repository_1.GroupRepository])
], LoginHandler);
//# sourceMappingURL=login.command.js.map