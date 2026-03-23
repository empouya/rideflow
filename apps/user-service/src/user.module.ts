import { Module } from '@nestjs/common';
import { USER_PROFILE_REPOSITORY } from './domain/repositories/user-profile.repository.interface';
import { EVENT_PUBLISHER } from './application/ports/event-publisher.interface';
import { PrismaService } from './database/prisma.service';
import { PrismaUserProfileRepository } from './infrastructure/db/user-profile.repository';
import { CreateUserProfileUseCase } from './application/use-cases/create-user-profile.usecase';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.usecase';

@Module({
    providers: [
        PrismaService,
        {
            provide: USER_PROFILE_REPOSITORY,
            useClass: PrismaUserProfileRepository,
        },
        {
            provide: EVENT_PUBLISHER,
            useClass: class {
                async publish() { }
            },
        },
        CreateUserProfileUseCase,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
    ],
    exports: [
        USER_PROFILE_REPOSITORY,
        EVENT_PUBLISHER,
        PrismaService,
        CreateUserProfileUseCase,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
    ],
})
export class UserModule { }