import { Injectable } from '@nestjs/common';
import {
    IEventPublisher,
    DomainEvent,
} from '../../application/ports/event-publisher.interface';

@Injectable()
export class InMemoryEventPublisher implements IEventPublisher {
    async publish(event: DomainEvent): Promise<void> {
        console.log(
            JSON.stringify({
                level: 30,
                time: Date.now(),
                msg: `Event published: ${event.eventType}`,
                eventType: event.eventType,
                payload: event.payload,
            }),
        );
    }
}