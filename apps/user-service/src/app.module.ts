import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user.module';
import { HealthController } from './interfaces/controllers/health.controller';
import { MetricsController } from './interfaces/controllers/metrics.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        UserModule,
    ],
    controllers: [HealthController, MetricsController],
})
export class AppModule { }