import { Inject } from '@nestjs/common';
import { DriverLocationNotFoundException } from '../../domain/exceptions/location.exceptions';
import {
    ILocationRepository,
    LOCATION_REPOSITORY,
} from '../../domain/repositories/location.repository.interface';
import { DriverLocation } from '../../domain/value-objects/driver-location.vo';

export interface GetDriverLocationInput {
    driverId: string;
}

export class GetDriverLocationUseCase {
    constructor(
        @Inject(LOCATION_REPOSITORY)
        private readonly locationRepository: ILocationRepository,
    ) { }

    async execute(input: GetDriverLocationInput): Promise<DriverLocation> {
        const location = await this.locationRepository.getDriverLocation(input.driverId);

        if (!location) {
            throw new DriverLocationNotFoundException(input.driverId);
        }

        return location;
    }
}
