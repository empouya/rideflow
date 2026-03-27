import { Injectable } from '@nestjs/common';
import { logger } from '../../common/logger/logger.service';
import { ProvisionDriverUseCase } from '../../application/use-cases/provision-driver.usecase';
import { UserProfileCreatedEvent } from '../contracts/user.profile-created.event';

@Injectable()
export class UserProfileCreatedConsumer {
    constructor(
        private readonly provisionDriverUseCase: ProvisionDriverUseCase,
    ) { }

    async handle(event: UserProfileCreatedEvent): Promise<void> {
        logger.info(
            { eventType: event.eventType, userId: event.payload.userId, role: event.payload.role },
            `Consuming event: ${event.eventType}`,
        );

        if (event.payload.role !== 'DRIVER') {
            logger.debug({ userId: event.payload.userId, role: event.payload.role }, 'Skipping non-driver user profile event');
            return;
        }

        await this.provisionDriverUseCase.execute({
            userId: event.payload.userId,
        });
    }
}
