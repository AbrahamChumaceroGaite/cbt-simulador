"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_ws_1 = require("@nestjs/platform-ws");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3002', credentials: true });
    await app.listen(process.env.PORT ?? 4002);
    console.log(`Simulador API running on port ${process.env.PORT ?? 4002}`);
}
bootstrap();
//# sourceMappingURL=main.js.map