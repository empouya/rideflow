import { DriverAlreadyExistsException, DriverEligibilityException } from '../exceptions/driver.exceptions';
import { DriverOnboardingStatus } from '../enums/driver-onboarding-status.enum';
import { DriverStatus } from '../enums/driver-status.enum';
import { Vehicle } from '../value-objects/vehicle.vo';

export class Driver {
    constructor(
        public readonly userId: string,
        public readonly status: DriverStatus,
        public readonly onboardingStatus: DriverOnboardingStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly lastStatusChangedAt: Date,
        public readonly licenseNumber?: string,
        public readonly licenseCountry?: string,
        public readonly licenseExpiresAt?: Date,
        public readonly approvedAt?: Date,
        public readonly vehicle?: Vehicle,
    ) { }

    static provision(userId: string): Driver {
        const now = new Date();

        return new Driver(
            userId,
            DriverStatus.OFFLINE,
            DriverOnboardingStatus.PENDING,
            now,
            now,
            now,
        );
    }

    static register(props: {
        userId: string;
        licenseNumber: string;
        licenseCountry: string;
        licenseExpiresAt: Date;
        vehicle: Vehicle;
    }): Driver {
        const now = new Date();
        Driver.assertRegistrationReadiness(props.licenseExpiresAt, props.vehicle, now);

        return new Driver(
            props.userId,
            DriverStatus.OFFLINE,
            DriverOnboardingStatus.ACTIVE,
            now,
            now,
            now,
            Driver.normalizeLicenseNumber(props.licenseNumber),
            Driver.normalizeCountry(props.licenseCountry),
            props.licenseExpiresAt,
            now,
            props.vehicle,
        );
    }

    completeRegistration(props: {
        licenseNumber: string;
        licenseCountry: string;
        licenseExpiresAt: Date;
        vehicle: Vehicle;
    }): Driver {
        if (this.isRegistered()) {
            throw new DriverAlreadyExistsException(this.userId);
        }

        const now = new Date();
        Driver.assertRegistrationReadiness(props.licenseExpiresAt, props.vehicle, now);

        return new Driver(
            this.userId,
            DriverStatus.OFFLINE,
            DriverOnboardingStatus.ACTIVE,
            this.createdAt,
            now,
            this.lastStatusChangedAt,
            Driver.normalizeLicenseNumber(props.licenseNumber),
            Driver.normalizeCountry(props.licenseCountry),
            props.licenseExpiresAt,
            now,
            props.vehicle,
        );
    }

    updateStatus(nextStatus: DriverStatus): Driver {
        if (nextStatus === DriverStatus.ONLINE) {
            this.assertCanGoOnline();
        }

        const now = new Date();

        return new Driver(
            this.userId,
            nextStatus,
            this.onboardingStatus,
            this.createdAt,
            now,
            now,
            this.licenseNumber,
            this.licenseCountry,
            this.licenseExpiresAt,
            this.approvedAt,
            this.vehicle,
        );
    }

    isRegistered(): boolean {
        return this.onboardingStatus === DriverOnboardingStatus.ACTIVE
            && Boolean(this.licenseNumber)
            && Boolean(this.licenseExpiresAt)
            && Boolean(this.vehicle);
    }

    private assertCanGoOnline(): void {
        if (this.onboardingStatus !== DriverOnboardingStatus.ACTIVE) {
            throw new DriverEligibilityException('Driver onboarding is not complete');
        }

        if (!this.licenseExpiresAt || !this.vehicle || !this.licenseNumber) {
            throw new DriverEligibilityException('Driver registration is incomplete');
        }

        if (this.licenseExpiresAt.getTime() <= Date.now()) {
            throw new DriverEligibilityException('Driver license has expired');
        }

        this.vehicle.ensureEligibleForMarketplaceTrips(new Date());
    }

    private static assertRegistrationReadiness(
        licenseExpiresAt: Date,
        vehicle: Vehicle,
        referenceDate: Date,
    ): void {
        if (licenseExpiresAt.getTime() <= referenceDate.getTime()) {
            throw new DriverEligibilityException('Driver license must be valid in the future');
        }

        vehicle.ensureEligibleForMarketplaceTrips(referenceDate);
    }

    private static normalizeLicenseNumber(licenseNumber: string): string {
        return licenseNumber.trim().toUpperCase();
    }

    private static normalizeCountry(country: string): string {
        return country.trim().toUpperCase();
    }
}
