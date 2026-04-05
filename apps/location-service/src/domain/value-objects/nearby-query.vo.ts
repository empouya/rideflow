import { InvalidCoordinatesException } from '../exceptions/location.exceptions';

export class NearbyQuery {
    constructor(
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly radiusKm: number,
        public readonly limit: number,
    ) { }

    static create(props: {
        latitude: number;
        longitude: number;
        radiusKm: number;
        limit?: number;
    }): NearbyQuery {
        NearbyQuery.assertLatitude(props.latitude);
        NearbyQuery.assertLongitude(props.longitude);
        NearbyQuery.assertRadius(props.radiusKm);

        const limit = props.limit ?? 10;

        return new NearbyQuery(
            props.latitude,
            props.longitude,
            props.radiusKm,
            limit,
        );
    }

    private static assertLatitude(latitude: number): void {
        if (latitude < -90 || latitude > 90) {
            throw new InvalidCoordinatesException(
                `Latitude must be between -90 and 90. Received: ${latitude}`,
            );
        }
    }

    private static assertLongitude(longitude: number): void {
        if (longitude < -180 || longitude > 180) {
            throw new InvalidCoordinatesException(
                `Longitude must be between -180 and 180. Received: ${longitude}`,
            );
        }
    }

    private static assertRadius(radiusKm: number): void {
        if (radiusKm < 0.1 || radiusKm > 50) {
            throw new InvalidCoordinatesException(
                `Radius must be between 0.1 and 50 km. Received: ${radiusKm}`,
            );
        }
    }
}
