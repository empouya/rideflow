import { Injectable } from '@nestjs/common';
import { IEventPublisher } from '../../application/ports/event-publisher.interface';
import { logger } from '../../common/logger/logger.service';

@Injectable()
export class InMemoryEventPublisher implements IEventPublisher {
    async publish(event: {
        eventType: string;
        payload: Record<string, unknown>;
        metadata: {
            version: string;
            source: string;
        };
    }): Promise<void> {
        logger.debug(
            {
                eventType: event.eventType,
                payload: event.payload,
                metadata: event.metadata,
            },
            'In-memory event published',
        );
    }
}
