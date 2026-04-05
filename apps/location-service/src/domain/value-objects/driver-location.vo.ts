import { InvalidCoordinatesException } from '../exceptions/location.exceptions';

export class DriverLocation {
    constructor(
        public readonly driverId: string,
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly timestamp: Date,
    ) { }

    static create(props: {
        driverId: string;
        latitude: number;
        longitude: number;
        timestamp?: Date;
    }): DriverLocation {
        DriverLocation.assertLatitude(props.latitude);
        DriverLocation.assertLongitude(props.longitude);

        return new DriverLocation(
            props.driverId,
            props.latitude,
            props.longitude,
            props.timestamp ?? new Date(),
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
}
