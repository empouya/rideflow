import { Module } from '@nestjs/common';
import { USER_PROFILE_REPOSITORY } from './domain/repositories/user-profile.repository.interface';
import { EVENT_PUBLISHER } from './application/ports/event-publisher.interface';
import { PrismaService } from './database/prisma.service';
import { PrismaUserProfileRepository } from './infrastructure/db/user-profile.repository';
import { CreateUserProfileUseCase } from './application/use-cases/create-user-profile.usecase';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.usecase';
import { UserController } from './interfaces/controllers/user.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { UserKafkaEventPublisher } from './events/publishers/kafka.publisher';
import { AuthUserRegisteredConsumer } from './events/consumers/auth-user-registered.consumer';
import { AuthEventsKafkaConsumer } from './events/consumers/auth-events.consumer';

@Module({
    controllers: [UserController],
    providers: [
        PrismaService,
        {
            provide: USER_PROFILE_REPOSITORY,
            useClass: PrismaUserProfileRepository,
        },
        {
            provide: EVENT_PUBLISHER,
            useClass: UserKafkaEventPublisher,
        },
        CreateUserProfileUseCase,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
        JwtAuthGuard,
        AuthUserRegisteredConsumer,
        AuthEventsKafkaConsumer,
    ],
    exports: [
        USER_PROFILE_REPOSITORY,
        EVENT_PUBLISHER,
        PrismaService,
        CreateUserProfileUseCase,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
        JwtAuthGuard,
        AuthUserRegisteredConsumer,
        AuthEventsKafkaConsumer,
    ],
})
export class UserModule { }