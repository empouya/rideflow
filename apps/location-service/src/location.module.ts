import { Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from './application/ports/event-publisher.interface';
import { FindNearbyDriversUseCase } from './application/use-cases/find-nearby-drivers.usecase';
import { GetDriverLocationUseCase } from './application/use-cases/get-driver-location.usecase';
import { UpdateLocationUseCase } from './application/use-cases/update-location.usecase';
import { RedisLocationRepository } from './infrastructure/redis/location.repository';
import { RedisService } from './infrastructure/redis/redis.service';
import { LOCATION_REPOSITORY } from './domain/repositories/location.repository.interface';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { LocationController } from './interfaces/controllers/location.controller';
import { InMemoryEventPublisher } from './events/publishers/in-memory.publisher';

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
            useClass: InMemoryEventPublisher,
        },
        UpdateLocationUseCase,
        FindNearbyDriversUseCase,
        GetDriverLocationUseCase,
        JwtAuthGuard,
    ],
    exports: [
        LOCATION_REPOSITORY,
        EVENT_PUBLISHER,
        RedisService,
        UpdateLocationUseCase,
        FindNearbyDriversUseCase,
        GetDriverLocationUseCase,
        JwtAuthGuard,
    ],
})
export class LocationModule { }
