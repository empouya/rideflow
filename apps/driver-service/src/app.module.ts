import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DriverModule } from './driver.module';
import { HealthController } from './interfaces/controllers/health.controller';
import { MetricsController } from './interfaces/controllers/metrics.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        DriverModule,
    ],
    controllers: [HealthController, MetricsController],
})
export class AppModule { }
