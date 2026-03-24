export interface UserProfileUpdatedEvent {
    eventType: 'user.profile_updated';
    payload: {
        userId: string;
        name: string;
        phone: string | null;
        avatarUrl: string | null;
        timestamp: string;
    };
    metadata: {
        version: string;
        source: string;
    };
}