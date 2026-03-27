import { UpdateDriverStatusUseCase } from './update-driver-status.usecase';
import { Driver } from '../../domain/entities/driver.entity';
import { IDriverRepository } from '../../domain/repositories/driver.repository.interface';
import { IEventPublisher } from '../ports/event-publisher.interface';
import { DriverStatus } from '../../domain/enums/driver-status.enum';
import { Vehicle } from '../../domain/value-objects/vehicle.vo';

describe('UpdateDriverStatusUseCase', () => {
    it('should reject online activation when the driver license is expired', async () => {
        const driver = Driver.register({
            userId: 'driver-expired',
            licenseNumber: 'EXP-001',
            licenseCountry: 'ES',
            licenseExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
            vehicle: Vehicle.create({
                make: 'Toyota',
                model: 'Corolla',
                color: 'White',
                plateNumber: 'EXP001',
                year: new Date().getUTCFullYear(),
                seatCount: 4,
                inspectionExpiresAt: new Date('2030-02-01T00:00:00.000Z'),
            }),
        });
        const expiredDriver = new Driver(
            driver.userId,
            driver.status,
            driver.onboardingStatus,
            driver.createdAt,
            driver.updatedAt,
            driver.lastStatusChangedAt,
            driver.licenseNumber,
            driver.licenseCountry,
            new Date('2020-01-01T00:00:00.000Z'),
            driver.approvedAt,
            driver.vehicle,
        );

        const repository: jest.Mocked<IDriverRepository> = {
            save: jest.fn(),
            update: jest.fn(),
            findById: jest.fn().mockResolvedValue(expiredDriver),
            findByLicenseNumber: jest.fn(),
            findByPlateNumber: jest.fn(),
        };
        const publisher: jest.Mocked<IEventPublisher> = {
            publish: jest.fn().mockResolvedValue(undefined),
        };

        const useCase = new UpdateDriverStatusUseCase(repository, publisher);

        await expect(
            useCase.execute({
                userId: 'driver-expired',
                status: DriverStatus.ONLINE,
            }),
        ).rejects.toThrow('Driver license has expired');
    });
});
