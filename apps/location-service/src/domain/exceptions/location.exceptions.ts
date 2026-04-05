export class InvalidCoordinatesException extends Error {
    constructor(message = 'Invalid coordinates') {
        super(message);
        this.name = 'InvalidCoordinatesException';
    }
}

export class DriverLocationNotFoundException extends Error {
    constructor(driverId: string) {
        super(`Driver location not found: ${driverId}`);
        this.name = 'DriverLocationNotFoundException';
    }
}
