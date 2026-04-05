import { UpdateLocationUseCase } from './update-location.usecase';
import { InvalidCoordinatesException } from '../../domain/exceptions/location.exceptions';
import { DriverLocation } from '../../domain/value-objects/driver-location.vo';

describe('UpdateLocationUseCase', () => {
    const repository = {
        updateLocation: jest.fn<Promise<void>, [DriverLocation]>(),
        findNearby: jest.fn(),
        removeDriver: jest.fn(),
        getDriverLocation: jest.fn(),
    };

    const eventPublisher = {
        publish: jest.fn<Promise<void>, [any]>(),
    };

    let useCase: UpdateLocationUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new UpdateLocationUseCase(
            repository,
            eventPublisher,
        );
    });

    it('should update location and publish event', async () => {
        await useCase.execute({
            driverId: 'driver-001',
            latitude: 40.7128,
            longitude: -74.0060,
        });

        expect(repository.updateLocation).toHaveBeenCalledTimes(1);
        expect(eventPublisher.publish).toHaveBeenCalledTimes(1);

        const savedLocation = repository.updateLocation.mock.calls[0][0];
        expect(savedLocation.driverId).toBe('driver-001');
        expect(savedLocation.latitude).toBe(40.7128);
        expect(savedLocation.longitude).toBe(-74.0060);

        expect(eventPublisher.publish).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'driver.location_updated',
                payload: expect.objectContaining({
                    driverId: 'driver-001',
                    latitude: 40.7128,
                    longitude: -74.0060,
                }),
                metadata: {
                    version: '1.0',
                    source: 'location-service',
                },
            }),
        );
    });

    it('should throw for invalid latitude', async () => {
        await expect(
            useCase.execute({
                driverId: 'driver-001',
                latitude: 120,
                longitude: -74.0060,
            }),
        ).rejects.toBeInstanceOf(InvalidCoordinatesException);

        expect(repository.updateLocation).not.toHaveBeenCalled();
        expect(eventPublisher.publish).not.toHaveBeenCalled();
    });
});
