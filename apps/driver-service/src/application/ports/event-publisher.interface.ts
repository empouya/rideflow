export interface DomainEvent {
    eventType: string;
    payload: Record<string, unknown>;
    metadata: {
        version: string;
        source: string;
    };
}

export interface IEventPublisher {
    publish(event: DomainEvent): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('IEventPublisher');
