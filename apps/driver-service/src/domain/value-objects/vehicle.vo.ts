import { DriverEligibilityException } from '../exceptions/driver.exceptions';
import { VehicleCategory } from '../enums/vehicle-category.enum';

export class Vehicle {
    constructor(
        public readonly make: string,
        public readonly model: string,
        public readonly color: string,
        public readonly plateNumber: string,
        public readonly year: number,
        public readonly seatCount: number,
        public readonly category: VehicleCategory,
        public readonly inspectionExpiresAt: Date,
    ) { }

    static create(props: {
        make: string;
        model: string;
        color: string;
        plateNumber: string;
        year: number;
        seatCount: number;
        category?: VehicleCategory;
        inspectionExpiresAt: Date;
    }): Vehicle {
        const make = props.make.trim();
        const model = props.model.trim();
        const color = props.color.trim();
        const plateNumber = props.plateNumber.trim().toUpperCase();
        const currentYear = new Date().getUTCFullYear();

        if (!make || !model || !color || !plateNumber) {
            throw new DriverEligibilityException('Vehicle details must be fully provided');
        }

        if (props.year < 1980 || props.year > currentYear + 1) {
            throw new DriverEligibilityException('Vehicle year is outside supported limits');
        }

        if (props.seatCount < 2 || props.seatCount > 8) {
            throw new DriverEligibilityException('Vehicle seat count must be between 2 and 8');
        }

        return new Vehicle(
            make,
            model,
            color,
            plateNumber,
            props.year,
            props.seatCount,
            props.category ?? VehicleCategory.STANDARD,
            props.inspectionExpiresAt,
        );
    }

    ensureEligibleForMarketplaceTrips(referenceDate: Date): void {
        const minimumVehicleYear = referenceDate.getUTCFullYear() - 15;

        if (this.year < minimumVehicleYear) {
            throw new DriverEligibilityException('Vehicle exceeds the marketplace age limit');
        }

        if (this.inspectionExpiresAt.getTime() <= referenceDate.getTime()) {
            throw new DriverEligibilityException('Vehicle inspection has expired');
        }
    }
}
