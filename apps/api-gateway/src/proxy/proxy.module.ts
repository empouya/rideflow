import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthMiddleware } from '../middleware/jwt-auth.middleware';
import { createAuthProxy } from './auth.proxy';
import { createUserProxy } from './user.proxy';
import { createDriverProxy } from './driver.proxy';

@Module({
    imports: [ConfigModule],
    providers: [JwtAuthMiddleware],
})
export class ProxyModule implements NestModule {
    constructor(private readonly config: ConfigService) { }

    configure(consumer: MiddlewareConsumer): void {
        // ── AUTH ROUTES — no JWT required ──────────────────────────────
        consumer
            .apply(createAuthProxy(this.config))
            .forRoutes(
                { path: 'auth/register', method: RequestMethod.POST },
                { path: 'auth/login', method: RequestMethod.POST },
                { path: 'auth/refresh', method: RequestMethod.POST },
            );

        // ── USER ROUTES — JWT required ──────────────────────────────────
        consumer
            .apply(JwtAuthMiddleware, createUserProxy(this.config))
            .forRoutes(
                { path: 'users/:id', method: RequestMethod.GET },
                { path: 'users/:id', method: RequestMethod.PATCH },
            );

        // ── DRIVER ROUTES — JWT required ───────────────────────────────
        consumer
            .apply(JwtAuthMiddleware, createDriverProxy(this.config))
            .forRoutes(
                { path: 'drivers/register', method: RequestMethod.POST },
                { path: 'drivers/:id/status', method: RequestMethod.PATCH },
                { path: 'drivers/:id', method: RequestMethod.GET },
            );
    }
}