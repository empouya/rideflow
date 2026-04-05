import { Inject } from '@nestjs/common';
import {
    ILocationRepository,
    LOCATION_REPOSITORY,
} from '../../domain/repositories/location.repository.interface';
import { DriverLocation } from '../../domain/value-objects/driver-location.vo';
import { NearbyQuery } from '../../domain/value-objects/nearby-query.vo';

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

        return this.locationRepository.findNearby(query);
    }
}
