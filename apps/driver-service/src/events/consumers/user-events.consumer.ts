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
import { UserProfileCreatedEvent } from '../contracts/user.profile-created.event';
import { UserProfileCreatedConsumer } from './user-profile-created.consumer';

@Injectable()
export class UserEventsKafkaConsumer
    extends KafkaEventConsumer
    implements OnModuleInit, OnModuleDestroy {
    constructor(
        config: ConfigService,
        private readonly userProfileCreatedConsumer: UserProfileCreatedConsumer,
    ) {
        super({
            ...buildKafkaConnectionOptions({
                clientId: config.get<string>('KAFKA_CLIENT_ID') ?? 'rideflow-driver-service',
                brokerList: config.getOrThrow<string>('KAFKA_BROKERS'),
            }),
            groupId: config.get<string>('KAFKA_CONSUMER_GROUP_ID') ?? 'driver-service-group',
            topics: ['user.profile_created'],
            fromBeginning: false,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.start();
        logger.info('Driver Kafka consumer connected');
    }

    async onModuleDestroy(): Promise<void> {
        await this.stop();
        logger.info('Driver Kafka consumer disconnected');
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
            'Driver service received Kafka event',
        );

        switch (event.eventType) {
            case 'user.profile_created':
                await this.userProfileCreatedConsumer.handle(
                    event as UserProfileCreatedEvent,
                );
                break;
            default:
                logger.warn({ eventType: event.eventType }, 'Unhandled Kafka event');
        }
    }
}
