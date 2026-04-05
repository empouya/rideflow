import { Inject } from '@nestjs/common';
import {
    ILocationRepository,
    LOCATION_REPOSITORY,
} from '../../domain/repositories/location.repository.interface';
import { DriverLocation } from '../../domain/value-objects/driver-location.vo';
import { NearbyQuery } from '../../domain/value-objects/nearby-query.vo';
import { logger } from '../../common/logger/logger.service';

export interface FindNearbyDriversInput {
    latitude: number;
    longitude: number;
    radiusKm: number;
    limit?: number;
}

export class FindNearbyDriversUseCase {
    constructor(
        @Inject(LOCATION_REPOSITORY)
        private readonly locationRepository: ILocationRepository,
    ) { }

    async execute(input: FindNearbyDriversInput): Promise<DriverLocation[]> {
        const query = NearbyQuery.create({
            latitude: input.latitude,
            longitude: input.longitude,
            radiusKm: input.radiusKm,
            limit: input.limit,
        });

        const results = await this.locationRepository.findNearby(query);

        logger.info(
            {
                latitude: query.latitude,
                longitude: query.longitude,
                radiusKm: query.radiusKm,
                count: results.length,
            },
            'Nearby drivers located successfully',
        );

        return results;
    }
}
