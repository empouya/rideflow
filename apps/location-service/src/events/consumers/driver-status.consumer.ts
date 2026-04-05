import { Inject, Injectable } from '@nestjs/common';
import { logger } from '../../common/logger/logger.service';
import {
    ILocationRepository,
    LOCATION_REPOSITORY,
} from '../../domain/repositories/location.repository.interface';
import { DriverStatusUpdatedEvent } from '../contracts/driver.status-updated.event';

@Injectable()
export class DriverStatusConsumer {
    constructor(
        @Inject(LOCATION_REPOSITORY)
        private readonly locationRepository: ILocationRepository,
    ) { }

    async handle(event: DriverStatusUpdatedEvent): Promise<void> {
        const driverId = event.payload.userId;
        const status = event.payload.status;

        if (status === 'OFFLINE') {
            await this.locationRepository.removeDriver(driverId);

            logger.info(
                { driverId, status, action: 'removed' },
                'Removing driver from location index',
            );
            return;
        }

        logger.info(
            { driverId, status, action: 'skipped' },
            'Driver status update does not require location removal',
        );
    }
}
