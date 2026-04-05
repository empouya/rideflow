import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    buildKafkaConnectionOptions,
    DomainEvent,
    KafkaEventConsumer,
} from '@rideflow/kafka-client';
import { logger } from '../../common/logger/logger.service';
import { DriverStatusUpdatedEvent } from '../contracts/driver.status-updated.event';
import { DriverStatusConsumer } from './driver-status.consumer';

@Injectable()
export class DriverEventsKafkaConsumer
    extends KafkaEventConsumer
    implements OnModuleInit, OnModuleDestroy {
    constructor(
        config: ConfigService,
        private readonly driverStatusConsumer: DriverStatusConsumer,
    ) {
        super({
            ...buildKafkaConnectionOptions({
                clientId: config.get<string>('KAFKA_CLIENT_ID') ?? 'rideflow-location-service',
                brokerList: config.getOrThrow<string>('KAFKA_BROKERS'),
            }),
            groupId: config.get<string>('KAFKA_CONSUMER_GROUP_ID') ?? 'location-service-group',
            topics: ['driver.status_updated'],
            fromBeginning: false,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.start();
        logger.info('Location Kafka consumer connected');
    }

    async onModuleDestroy(): Promise<void> {
        await this.stop();
        logger.info('Location Kafka consumer disconnected');
    }

    protected async handle(
        event: DomainEvent,
        context: {
            topic: string;
            partition: number;
            offset: string;
            key?: string;
        },
    ): Promise<void> {
        logger.info(
            {
                eventType: event.eventType,
                topic: context.topic,
                partition: context.partition,
                offset: context.offset,
                key: context.key ?? null,
            },
            'Location service received Kafka event',
        );

        switch (event.eventType) {
            case 'driver.status_updated':
                await this.driverStatusConsumer.handle(
                    event as DriverStatusUpdatedEvent,
                );
                break;
            default:
                logger.warn({ eventType: event.eventType }, 'Unhandled Kafka event');
        }
    }
}
