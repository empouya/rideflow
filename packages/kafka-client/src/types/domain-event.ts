export interface DomainEvent {
    eventType: string;
    payload: Record<string, unknown>;
    metadata: {
        version: string;
        source: string;
    };
}
