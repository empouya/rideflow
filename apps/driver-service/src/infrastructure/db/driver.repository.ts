import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Driver } from '../../domain/entities/driver.entity';
import { DriverOnboardingStatus } from '../../domain/enums/driver-onboarding-status.enum';
import { DriverStatus } from '../../domain/enums/driver-status.enum';
import { VehicleCategory } from '../../domain/enums/vehicle-category.enum';
import {
    IDriverRepository,
} from '../../domain/repositories/driver.repository.interface';
import { Vehicle } from '../../domain/value-objects/vehicle.vo';

type DriverRecord = {
    userId: string;
    status: string;
    onboardingStatus: string;
    licenseNumber: string | null;
    licenseCountry: string | null;
    licenseExpiresAt: Date | null;
    approvedAt: Date | null;
    lastStatusChangedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    vehicle: {
        make: string;
        model: string;
        color: string;
        plateNumber: string;
        year: number;
        seatCount: number;
        category: string;
        inspectionExpiresAt: Date;
    } | null;
};

@Injectable()
export class PrismaDriverRepository implements IDriverRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(driver: Driver): Promise<Driver> {
        const record = await this.prisma.driver.create({
            data: this.toPersistence(driver),
            include: {
                vehicle: true,
            },
        });

        return this.toEntity(record);
    }

    async update(driver: Driver): Promise<Driver> {
        const vehicleData = driver.vehicle
            ? {
                upsert: {
                    update: {
                        make: driver.vehicle.make,
                        model: driver.vehicle.model,
                        color: driver.vehicle.color,
                        plateNumber: driver.vehicle.plateNumber,
                        year: driver.vehicle.year,
                        seatCount: driver.vehicle.seatCount,
                        category: driver.vehicle.category,
                        inspectionExpiresAt: driver.vehicle.inspectionExpiresAt,
                    },
                    create: {
                        driverUserId: driver.userId,
                        make: driver.vehicle.make,
                        model: driver.vehicle.model,
                        color: driver.vehicle.color,
                        plateNumber: driver.vehicle.plateNumber,
                        year: driver.vehicle.year,
                        seatCount: driver.vehicle.seatCount,
                        category: driver.vehicle.category,
                        inspectionExpiresAt: driver.vehicle.inspectionExpiresAt,
                    },
                },
            }
            : undefined;

        const record = await this.prisma.driver.update({
            where: { userId: driver.userId },
            data: {
                status: driver.status,
                onboardingStatus: driver.onboardingStatus,
                licenseNumber: driver.licenseNumber,
                licenseCountry: driver.licenseCountry,
                licenseExpiresAt: driver.licenseExpiresAt,
                approvedAt: driver.approvedAt,
                lastStatusChangedAt: driver.lastStatusChangedAt,
                updatedAt: driver.updatedAt,
                vehicle: vehicleData,
            },
            include: {
                vehicle: true,
            },
        });

        return this.toEntity(record);
    }

    async findById(userId: string): Promise<Driver | null> {
        const record = await this.prisma.driver.findUnique({
            where: { userId },
            include: {
                vehicle: true,
            },
        });

        if (!record) {
            return null;
        }

        return this.toEntity(record);
    }

    async findByLicenseNumber(licenseNumber: string): Promise<Driver | null> {
        const record = await this.prisma.driver.findUnique({
            where: { licenseNumber },
            include: {
                vehicle: true,
            },
        });

        if (!record) {
            return null;
        }

        return this.toEntity(record);
    }

    async findByPlateNumber(plateNumber: string): Promise<Driver | null> {
        const record = await this.prisma.driver.findFirst({
            where: {
                vehicle: {
                    plateNumber,
                },
            },
            include: {
                vehicle: true,
            },
        });

        if (!record) {
            return null;
        }

        return this.toEntity(record);
    }

    private toPersistence(driver: Driver) {
        return {
            userId: driver.userId,
            status: driver.status,
            onboardingStatus: driver.onboardingStatus,
            licenseNumber: driver.licenseNumber,
            licenseCountry: driver.licenseCountry,
            licenseExpiresAt: driver.licenseExpiresAt,
            approvedAt: driver.approvedAt,
            lastStatusChangedAt: driver.lastStatusChangedAt,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt,
            vehicle: driver.vehicle
                ? {
                    create: {
                        driverUserId: driver.userId,
                        make: driver.vehicle.make,
                        model: driver.vehicle.model,
                        color: driver.vehicle.color,
                        plateNumber: driver.vehicle.plateNumber,
                        year: driver.vehicle.year,
                        seatCount: driver.vehicle.seatCount,
                        category: driver.vehicle.category,
                        inspectionExpiresAt: driver.vehicle.inspectionExpiresAt,
                    },
                }
                : undefined,
        };
    }

    private toEntity(record: DriverRecord): Driver {
        const vehicle = record.vehicle
            ? new Vehicle(
                record.vehicle.make,
                record.vehicle.model,
                record.vehicle.color,
                record.vehicle.plateNumber,
                record.vehicle.year,
                record.vehicle.seatCount,
                record.vehicle.category as VehicleCategory,
                record.vehicle.inspectionExpiresAt,
            )
            : undefined;

        return new Driver(
            record.userId,
            record.status as DriverStatus,
            record.onboardingStatus as DriverOnboardingStatus,
            record.createdAt,
            record.updatedAt,
            record.lastStatusChangedAt,
            record.licenseNumber ?? undefined,
            record.licenseCountry ?? undefined,
            record.licenseExpiresAt ?? undefined,
            record.approvedAt ?? undefined,
            vehicle,
        );
    }
}
