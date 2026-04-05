export interface DriverStatusUpdatedEvent {
    eventType: 'driver.status_updated';
    payload: {
        userId: string;
        status: string;
        timestamp: string;
    };
    metadata: {
        version: string;
        source: string;
    };
}
