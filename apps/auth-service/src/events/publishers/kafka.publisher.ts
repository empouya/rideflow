import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    buildKafkaConnectionOptions,
    KafkaEventPublisher,
    DomainEvent,
} from '@rideflow/kafka-client';
import { IEventPublisher } from './event-publisher.interface';
import { logger } from '../../common/logger/logger.service';

@Injectable()
export class AuthKafkaEventPublisher
    implements IEventPublisher, OnModuleInit, OnModuleDestroy {
    private readonly publisher: KafkaEventPublisher;

    constructor(private readonly config: ConfigService) {
        this.publisher = new KafkaEventPublisher(
            buildKafkaConnectionOptions({
                clientId: this.config.get<string>('KAFKA_CLIENT_ID') ?? 'rideflow-auth-service',
                brokerList: this.config.getOrThrow<string>('KAFKA_BROKERS'),
            }),
        );
    }

    async onModuleInit(): Promise<void> {
        await this.publisher.connect();
        logger.info('Auth Kafka publisher connected');
    }

    async onModuleDestroy(): Promise<void> {
        await this.publisher.disconnect();
        logger.info('Auth Kafka publisher disconnected');
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
