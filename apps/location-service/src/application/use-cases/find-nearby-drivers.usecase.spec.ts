import { FindNearbyDriversUseCase } from './find-nearby-drivers.usecase';
import { InvalidCoordinatesException } from '../../domain/exceptions/location.exceptions';
import { DriverLocation } from '../../domain/value-objects/driver-location.vo';

describe('FindNearbyDriversUseCase', () => {
    const repository = {
        updateLocation: jest.fn(),
        findNearby: jest.fn<Promise<DriverLocation[]>, [any]>(),
        removeDriver: jest.fn(),
        getDriverLocation: jest.fn(),
    };

    let useCase: FindNearbyDriversUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new FindNearbyDriversUseCase(repository);
    });

    it('should return nearby drivers from repository', async () => {
        const locations = [
            DriverLocation.create({
                driverId: 'driver-001',
                latitude: 40.7128,
                longitude: -74.0060,
            }),
        ];

        repository.findNearby.mockResolvedValue(locations);

        const result = await useCase.execute({
            latitude: 40.7128,
            longitude: -74.0060,
            radiusKm: 5,
            limit: 10,
        });

        expect(repository.findNearby).toHaveBeenCalledTimes(1);
        expect(result).toEqual(locations);
    });

    it('should throw for invalid radius', async () => {
        await expect(
            useCase.execute({
                latitude: 40.7128,
                longitude: -74.0060,
                radiusKm: 100,
            }),
        ).rejects.toBeInstanceOf(InvalidCoordinatesException);

        expect(repository.findNearby).not.toHaveBeenCalled();
    });
});
