export interface AuthUserRegisteredEvent {
    eventType: 'auth.user_registered';
    payload: {
        userId: string;
        email: string;
        timestamp: string;
    };
    metadata: {
        version: string;
        source: string;
    };
}