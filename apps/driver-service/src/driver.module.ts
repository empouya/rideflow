import { Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from './application/ports/event-publisher.interface';
import { GetDriverUseCase } from './application/use-cases/get-driver.usecase';
import { ProvisionDriverUseCase } from './application/use-cases/provision-driver.usecase';
import { RegisterDriverUseCase } from './application/use-cases/register-driver.usecase';
import { UpdateDriverStatusUseCase } from './application/use-cases/update-driver-status.usecase';
import { PrismaService } from './database/prisma.service';
import { DRIVER_REPOSITORY } from './domain/repositories/driver.repository.interface';
import { PrismaDriverRepository } from './infrastructure/db/driver.repository';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { InMemoryEventPublisher } from './events/publishers/in-memory.publisher';
import { UserProfileCreatedConsumer } from './events/consumers/user-profile-created.consumer';

@Module({
    controllers: [],
    providers: [
        PrismaService,
        {
            provide: DRIVER_REPOSITORY,
            useClass: PrismaDriverRepository,
        },
        {
            provide: EVENT_PUBLISHER,
            useClass: InMemoryEventPublisher
        },
        ProvisionDriverUseCase,
        RegisterDriverUseCase,
        GetDriverUseCase,
        UpdateDriverStatusUseCase,
        JwtAuthGuard,
        UserProfileCreatedConsumer
    ],
    exports: [
        DRIVER_REPOSITORY,
        EVENT_PUBLISHER,
        PrismaService,
        ProvisionDriverUseCase,
        RegisterDriverUseCase,
        GetDriverUseCase,
        UpdateDriverStatusUseCase,
        JwtAuthGuard,
        UserProfileCreatedConsumer
    ],
})
export class DriverModule { }
