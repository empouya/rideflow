import { Injectable } from '@nestjs/common';
import { CreateUserProfileUseCase } from '../../application/use-cases/create-user-profile.usecase';
import { AuthUserRegisteredEvent } from '../contracts/auth.user-registered.event';
import { logger } from '../../common/logger/logger.service';

@Injectable()
export class AuthUserRegisteredConsumer {
    constructor(
        private readonly createUserProfileUseCase: CreateUserProfileUseCase,
    ) { }

    async handle(event: AuthUserRegisteredEvent): Promise<void> {
        logger.info(
            { eventType: event.eventType, userId: event.payload.userId },
            `Consuming event: ${event.eventType}`,
        );

        await this.createUserProfileUseCase.execute({
            userId: event.payload.userId,
            email: event.payload.email,
        });
    }
}