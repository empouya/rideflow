import { Inject } from '@nestjs/common';
import { logger } from '../../common/logger/logger.service';
import { Driver } from '../../domain/entities/driver.entity';
import { DriverNotFoundException } from '../../domain/exceptions/driver.exceptions';
import { DriverStatus } from '../../domain/enums/driver-status.enum';
import {
    DRIVER_REPOSITORY,
    IDriverRepository,
} from '../../domain/repositories/driver.repository.interface';
import {
    EVENT_PUBLISHER,
    IEventPublisher,
} from '../ports/event-publisher.interface';

export interface UpdateDriverStatusInput {
    userId: string;
    status: DriverStatus;
}

export class UpdateDriverStatusUseCase {
    constructor(
        @Inject(DRIVER_REPOSITORY)
        private readonly driverRepository: IDriverRepository,
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    async execute(input: UpdateDriverStatusInput): Promise<Driver> {
        const existing = await this.driverRepository.findById(input.userId);
        if (!existing) {
            throw new DriverNotFoundException(input.userId);
        }

        const updated = existing.updateStatus(input.status);
        const saved = await this.driverRepository.update(updated);

        await this.eventPublisher.publish({
            eventType: 'driver.status_updated',
            payload: {
                userId: saved.userId,
                status: saved.status,
                timestamp: saved.lastStatusChangedAt.toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'driver-service',
            },
        });

        logger.info({ userId: saved.userId, status: saved.status }, 'Driver status updated successfully');

        return saved;
    }
}
