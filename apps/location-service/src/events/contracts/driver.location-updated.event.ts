export interface DriverLocationUpdatedEvent {
    eventType: 'driver.location_updated';
    payload: {
        driverId: string;
        latitude: number;
        longitude: number;
        timestamp: string;
    };
    metadata: {
        version: '1.0';
        source: 'location-service';
    };
}
