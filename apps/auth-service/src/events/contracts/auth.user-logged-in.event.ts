export interface AuthUserLoggedInEvent {
    eventType: 'auth.user_logged_in';
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