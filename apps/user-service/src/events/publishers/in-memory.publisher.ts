import { Injectable } from '@nestjs/common';
import {
    IEventPublisher,
    DomainEvent,
} from '../../application/ports/event-publisher.interface';
import { logger } from '../../common/logger/logger.service';

@Injectable()
export class InMemoryEventPublisher implements IEventPublisher {
    async publish(event: DomainEvent): Promise<void> {
        logger.info(
            {
                eventType: event.eventType,
                payload: event.payload,
            },
            `Event published: ${event.eventType}`,
        );
    }
}