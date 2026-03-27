import { Inject } from '@nestjs/common';
import { logger } from '../../common/logger/logger.service';
import { Driver } from '../../domain/entities/driver.entity';
import {
    DriverAlreadyExistsException,
    DriverComplianceConflictException,
} from '../../domain/exceptions/driver.exceptions';
import { VehicleCategory } from '../../domain/enums/vehicle-category.enum';
import {
    DRIVER_REPOSITORY,
    IDriverRepository,
} from '../../domain/repositories/driver.repository.interface';
import { Vehicle } from '../../domain/value-objects/vehicle.vo';
import {
    EVENT_PUBLISHER,
    IEventPublisher,
} from '../ports/event-publisher.interface';

export interface RegisterDriverInput {
    userId: string;
    licenseNumber: string;
    licenseCountry: string;
    licenseExpiresAt: Date;
    vehicleMake: string;
    vehicleModel: string;
    vehicleColor: string;
    plateNumber: string;
    vehicleYear: number;
    seatCount: number;
    vehicleCategory?: VehicleCategory;
    inspectionExpiresAt: Date;
}

export class RegisterDriverUseCase {
    constructor(
        @Inject(DRIVER_REPOSITORY)
        private readonly driverRepository: IDriverRepository,
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    async execute(input: RegisterDriverInput): Promise<Driver> {
        const normalizedLicenseNumber = input.licenseNumber.trim().toUpperCase();
        const normalizedPlateNumber = input.plateNumber.trim().toUpperCase();
        const existing = await this.driverRepository.findById(input.userId);

        if (existing?.isRegistered()) {
            throw new DriverAlreadyExistsException(input.userId);
        }

        const conflictingLicenseDriver = await this.driverRepository.findByLicenseNumber(normalizedLicenseNumber);
        if (conflictingLicenseDriver && conflictingLicenseDriver.userId !== input.userId) {
            throw new DriverComplianceConflictException('licenseNumber', normalizedLicenseNumber);
        }

        const conflictingPlateDriver = await this.driverRepository.findByPlateNumber(normalizedPlateNumber);
        if (conflictingPlateDriver && conflictingPlateDriver.userId !== input.userId) {
            throw new DriverComplianceConflictException('plateNumber', normalizedPlateNumber);
        }

        const vehicle = Vehicle.create({
            make: input.vehicleMake,
            model: input.vehicleModel,
            color: input.vehicleColor,
            plateNumber: normalizedPlateNumber,
            year: input.vehicleYear,
            seatCount: input.seatCount,
            category: input.vehicleCategory,
            inspectionExpiresAt: input.inspectionExpiresAt,
        });

        const driver = existing
            ? existing.completeRegistration({
                licenseNumber: normalizedLicenseNumber,
                licenseCountry: input.licenseCountry,
                licenseExpiresAt: input.licenseExpiresAt,
                vehicle,
            })
            : Driver.register({
                userId: input.userId,
                licenseNumber: normalizedLicenseNumber,
                licenseCountry: input.licenseCountry,
                licenseExpiresAt: input.licenseExpiresAt,
                vehicle,
            });

        const saved = existing
            ? await this.driverRepository.update(driver)
            : await this.driverRepository.save(driver);

        await this.eventPublisher.publish({
            eventType: 'driver.registered',
            payload: {
                userId: saved.userId,
                status: saved.status,
                onboardingStatus: saved.onboardingStatus,
                vehicleCategory: saved.vehicle?.category ?? null,
                plateNumber: saved.vehicle?.plateNumber ?? null,
                timestamp: new Date().toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'driver-service',
            },
        });

        logger.info(
            {
                userId: saved.userId,
                status: saved.status,
                onboardingStatus: saved.onboardingStatus,
            },
            'Driver registered successfully',
        );

        return saved;
    }
}
