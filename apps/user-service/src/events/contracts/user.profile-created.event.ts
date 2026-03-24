export interface UserProfileCreatedEvent {
    eventType: 'user.profile_created';
    payload: {
        userId: string;
        name: string;
        role: string;
        timestamp: string;
    };
    metadata: {
        version: string;
        source: string;
    };
}