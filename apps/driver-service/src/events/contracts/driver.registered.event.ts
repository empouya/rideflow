export interface DriverRegisteredEvent {
    eventType: 'driver.registered';
    payload: {
        userId: string;
        status: string;
        onboardingStatus: string;
        vehicleCategory: string | null;
        plateNumber: string | null;
        timestamp: string;
    };
    metadata: {
        version: string;
        source: string;
    };
}
