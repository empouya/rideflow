export interface IEventPublisher {
    publish(event: {
        eventType: string;
        payload: Record<string, unknown>;
        metadata: {
            version: string;
            source: string;
        };
    }): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('IEventPublisher');
