import { DriverLocation } from '../value-objects/driver-location.vo';
import { NearbyQuery } from '../value-objects/nearby-query.vo';

export interface ILocationRepository {
    updateLocation(location: DriverLocation): Promise<void>;
    findNearby(query: NearbyQuery): Promise<DriverLocation[]>;
    removeDriver(driverId: string): Promise<void>;
    getDriverLocation(driverId: string): Promise<DriverLocation | null>;
}

export const LOCATION_REPOSITORY = Symbol('ILocationRepository');
