import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { DriverLocation } from '../../domain/value-objects/driver-location.vo';
import { NearbyQuery } from '../../domain/value-objects/nearby-query.vo';
import { ILocationRepository } from '../../domain/repositories/location.repository.interface';

@Injectable()
export class RedisLocationRepository implements ILocationRepository {
    private static readonly REDIS_KEY = 'locations:drivers';

    constructor(private readonly redisService: RedisService) { }

    async updateLocation(location: DriverLocation): Promise<void> {
        await this.redisService.client.geoadd(
            RedisLocationRepository.REDIS_KEY,
            location.longitude,
            location.latitude,
            location.driverId,
        );
    }

    async findNearby(query: NearbyQuery): Promise<DriverLocation[]> {
        const results = await this.redisService.client.call(
            'GEOSEARCH',
            RedisLocationRepository.REDIS_KEY,
            'FROMLONLAT',
            query.longitude.toString(),
            query.latitude.toString(),
            'BYRADIUS',
            query.radiusKm.toString(),
            'km',
            'ASC',
            'COUNT',
            query.limit.toString(),
            'WITHCOORD',
        ) as Array<[string, [string, string]]>;

        return results.map(([driverId, coordinates]) =>
            DriverLocation.create({
                driverId,
                longitude: Number(coordinates[0]),
                latitude: Number(coordinates[1]),
            }),
        );
    }

    async removeDriver(driverId: string): Promise<void> {
        await this.redisService.client.zrem(
            RedisLocationRepository.REDIS_KEY,
            driverId,
        );
    }

    async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
        const result = await this.redisService.client.geopos(
            RedisLocationRepository.REDIS_KEY,
            driverId,
        );

        const coordinates = result[0];

        if (!coordinates || coordinates[0] === null || coordinates[1] === null) {
            return null;
        }

        return DriverLocation.create({
            driverId,
            longitude: Number(coordinates[0]),
            latitude: Number(coordinates[1]),
        });
    }
}
