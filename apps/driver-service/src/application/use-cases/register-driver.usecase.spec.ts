import { RegisterDriverUseCase } from './register-driver.usecase';
import { IDriverRepository } from '../../domain/repositories/driver.repository.interface';
import { IEventPublisher } from '../ports/event-publisher.interface';
import { Driver } from '../../domain/entities/driver.entity';
import { DriverOnboardingStatus } from '../../domain/enums/driver-onboarding-status.enum';

describe('RegisterDriverUseCase', () => {
    const baseInput = {
        userId: 'driver-001',
        licenseNumber: 'es-1234',
        licenseCountry: 'es',
        licenseExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
        vehicleMake: 'Toyota',
        vehicleModel: 'Prius',
        vehicleColor: 'Black',
        plateNumber: 'abc123',
        vehicleYear: new Date().getUTCFullYear(),
        seatCount: 4,
        inspectionExpiresAt: new Date('2030-06-01T00:00:00.000Z'),
    };

    it('should register a new driver and publish an event', async () => {
        const repository: jest.Mocked<IDriverRepository> = {
            save: jest.fn(),
            update: jest.fn(),
            findById: jest.fn().mockResolvedValue(null),
            findByLicenseNumber: jest.fn().mockResolvedValue(null),
            findByPlateNumber: jest.fn().mockResolvedValue(null),
        };
        const publisher: jest.Mocked<IEventPublisher> = {
            publish: jest.fn().mockResolvedValue(undefined),
        };

        repository.save.mockImplementation(async (driver) => driver);

        const useCase = new RegisterDriverUseCase(repository, publisher);

        const driver = await useCase.execute(baseInput);

        expect(driver.userId).toBe(baseInput.userId);
        expect(driver.onboardingStatus).toBe(DriverOnboardingStatus.ACTIVE);
        expect(driver.licenseNumber).toBe('ES-1234');
        expect(driver.vehicle?.plateNumber).toBe('ABC123');
        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(publisher.publish).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'driver.registered',
            }),
        );
    });

    it('should complete registration for a provisioned driver', async () => {
        const existing = Driver.provision(baseInput.userId);
        const repository: jest.Mocked<IDriverRepository> = {
            save: jest.fn(),
            update: jest.fn(),
            findById: jest.fn().mockResolvedValue(existing),
            findByLicenseNumber: jest.fn().mockResolvedValue(null),
            findByPlateNumber: jest.fn().mockResolvedValue(null),
        };
        const publisher: jest.Mocked<IEventPublisher> = {
            publish: jest.fn().mockResolvedValue(undefined),
        };

        repository.update.mockImplementation(async (driver) => driver);

        const useCase = new RegisterDriverUseCase(repository, publisher);

        const driver = await useCase.execute(baseInput);

        expect(repository.update).toHaveBeenCalledTimes(1);
        expect(driver.onboardingStatus).toBe(DriverOnboardingStatus.ACTIVE);
    });
});
