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
import { AuthUserRegisteredConsumer } from './auth-user-registered.consumer';
import { AuthUserRegisteredEvent } from '../contracts/auth.user-registered.event';

@Injectable()
export class AuthEventsKafkaConsumer
    extends KafkaEventConsumer
    implements OnModuleInit, OnModuleDestroy {
    constructor(
        config: ConfigService,
        private readonly authUserRegisteredConsumer: AuthUserRegisteredConsumer,
    ) {
        super({
            ...buildKafkaConnectionOptions({
                clientId: config.get<string>('KAFKA_CLIENT_ID') ?? 'rideflow-user-service',
                brokerList: config.getOrThrow<string>('KAFKA_BROKERS'),
            }),
            groupId: config.get<string>('KAFKA_CONSUMER_GROUP_ID') ?? 'user-service-group',
            topics: ['auth.user_registered'],
            fromBeginning: false,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.start();
        logger.info('User Kafka consumer connected');
    }

    async onModuleDestroy(): Promise<void> {
        await this.stop();
        logger.info('User Kafka consumer disconnected');
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
            'User service received Kafka event',
        );

        switch (event.eventType) {
            case 'auth.user_registered':
                await this.authUserRegisteredConsumer.handle(
                    event as AuthUserRegisteredEvent,
                );
                break;
            default:
                logger.warn({ eventType: event.eventType }, 'Unhandled Kafka event');
        }
    }
}
