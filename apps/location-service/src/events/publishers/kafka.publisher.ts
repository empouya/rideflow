import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    buildKafkaConnectionOptions,
    DomainEvent,
    KafkaEventPublisher,
} from '@rideflow/kafka-client';
import { IEventPublisher } from '../../application/ports/event-publisher.interface';
import { logger } from '../../common/logger/logger.service';

@Injectable()
export class LocationKafkaEventPublisher
    implements IEventPublisher, OnModuleInit, OnModuleDestroy {
    private readonly publisher: KafkaEventPublisher;

    constructor(private readonly config: ConfigService) {
        this.publisher = new KafkaEventPublisher(
            buildKafkaConnectionOptions({
                clientId: this.config.get<string>('KAFKA_CLIENT_ID') ?? 'rideflow-location-service',
                brokerList: this.config.getOrThrow<string>('KAFKA_BROKERS'),
            }),
        );
    }

    async onModuleInit(): Promise<void> {
        await this.publisher.connect();
        logger.info('Location Kafka publisher connected');
    }

    async onModuleDestroy(): Promise<void> {
        await this.publisher.disconnect();
        logger.info('Location Kafka publisher disconnected');
    }

    async publish(event: DomainEvent): Promise<void> {
        await this.publisher.publish(event);

        logger.info(
            {
                eventType: event.eventType,
                payload: event.payload,
            },
            `Kafka event published: ${event.eventType}`,
        );
    }
}
