import { Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from './application/ports/event-publisher.interface';
import { FindNearbyDriversUseCase } from './application/use-cases/find-nearby-drivers.usecase';
import { GetDriverLocationUseCase } from './application/use-cases/get-driver-location.usecase';
import { UpdateLocationUseCase } from './application/use-cases/update-location.usecase';
import { LOCATION_REPOSITORY } from './domain/repositories/location.repository.interface';
import { DriverEventsKafkaConsumer } from './events/consumers/driver-events.consumer';
import { DriverStatusConsumer } from './events/consumers/driver-status.consumer';
import { LocationKafkaEventPublisher } from './events/publishers/kafka.publisher';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RedisLocationRepository } from './infrastructure/redis/location.repository';
import { RedisService } from './infrastructure/redis/redis.service';
import { LocationController } from './interfaces/controllers/location.controller';

@Module({
    controllers: [LocationController],
    providers: [
        RedisService,
        {
            provide: LOCATION_REPOSITORY,
            useClass: RedisLocationRepository,
        },
        {
            provide: EVENT_PUBLISHER,
            useClass: LocationKafkaEventPublisher,
        },
        UpdateLocationUseCase,
        FindNearbyDriversUseCase,
        GetDriverLocationUseCase,
        JwtAuthGuard,
        DriverStatusConsumer,
        DriverEventsKafkaConsumer,
    ],
    exports: [
        LOCATION_REPOSITORY,
        EVENT_PUBLISHER,
        RedisService,
        UpdateLocationUseCase,
        FindNearbyDriversUseCase,
        GetDriverLocationUseCase,
        JwtAuthGuard,
        DriverStatusConsumer,
        DriverEventsKafkaConsumer,
    ],
})
export class LocationModule { }
