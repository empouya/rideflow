import { Injectable } from '@nestjs/common';
import { CreateUserProfileUseCase } from '../../application/use-cases/create-user-profile.usecase';
import { AuthUserRegisteredEvent } from '../contracts/auth.user-registered.event';

@Injectable()
export class AuthUserRegisteredConsumer {
    constructor(
        private readonly createUserProfileUseCase: CreateUserProfileUseCase,
    ) { }

    async handle(event: AuthUserRegisteredEvent): Promise<void> {
        console.log(
            JSON.stringify({
                level: 30,
                time: Date.now(),
                msg: `Consuming event: ${event.eventType}`,
                eventType: event.eventType,
                userId: event.payload.userId,
                email: event.payload.email,
            }),
        );

        await this.createUserProfileUseCase.execute({
            userId: event.payload.userId,
            email: event.payload.email,
        });
    }
}