import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER, IEventPublisher } from '../ports/event-publisher.interface';
import {
    ILocationRepository,
    LOCATION_REPOSITORY,
} from '../../domain/repositories/location.repository.interface';
import { DriverLocation } from '../../domain/value-objects/driver-location.vo';

export interface UpdateLocationInput {
    driverId: string;
    latitude: number;
    longitude: number;
}

export class UpdateLocationUseCase {
    constructor(
        @Inject(LOCATION_REPOSITORY)
        private readonly locationRepository: ILocationRepository,
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    async execute(input: UpdateLocationInput): Promise<void> {
        const location = DriverLocation.create({
            driverId: input.driverId,
            latitude: input.latitude,
            longitude: input.longitude,
        });

        await this.locationRepository.updateLocation(location);

        await this.eventPublisher.publish({
            eventType: 'driver.location_updated',
            payload: {
                driverId: location.driverId,
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: location.timestamp.toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'location-service',
            },
        });
    }
}
