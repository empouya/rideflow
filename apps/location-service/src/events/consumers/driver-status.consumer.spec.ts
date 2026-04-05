import { DriverStatusConsumer } from './driver-status.consumer';

describe('DriverStatusConsumer', () => {
    const repository = {
        updateLocation: jest.fn(),
        findNearby: jest.fn(),
        removeDriver: jest.fn<Promise<void>, [string]>(),
        getDriverLocation: jest.fn(),
    };

    let consumer: DriverStatusConsumer;

    beforeEach(() => {
        jest.clearAllMocks();
        consumer = new DriverStatusConsumer(repository);
    });

    it('should remove driver when status is OFFLINE', async () => {
        await consumer.handle({
            eventType: 'driver.status_updated',
            payload: {
                userId: 'driver-001',
                status: 'OFFLINE',
                timestamp: new Date().toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'driver-service',
            },
        });

        expect(repository.removeDriver).toHaveBeenCalledWith('driver-001');
    });

    it('should skip removal when status is ONLINE', async () => {
        await consumer.handle({
            eventType: 'driver.status_updated',
            payload: {
                userId: 'driver-001',
                status: 'ONLINE',
                timestamp: new Date().toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'driver-service',
            },
        });

        expect(repository.removeDriver).not.toHaveBeenCalled();
    });
});
