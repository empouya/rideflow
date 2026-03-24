import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user.module';
import { HealthController } from './interfaces/controllers/health.controller';
import { MetricsController } from './interfaces/controllers/metrics.controller';
import { DevController } from './interfaces/controllers/dev.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        UserModule,
    ],
    controllers: [HealthController, MetricsController, DevController],
})
export class AppModule { }