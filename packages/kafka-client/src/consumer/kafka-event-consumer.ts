import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';
import { KafkaConnectionOptions } from '../config/kafka.config';
import { DomainEvent } from '../types/domain-event';

export interface KafkaConsumerOptions extends KafkaConnectionOptions {
    groupId: string;
    topics: string[];
    fromBeginning?: boolean;
}

export abstract class KafkaEventConsumer {
    private readonly kafka: Kafka;
    private readonly consumer: Consumer;
    private started = false;

    constructor(private readonly options: KafkaConsumerOptions) {
        this.kafka = new Kafka({
            clientId: options.clientId,
            brokers: options.brokers,
        });

        this.consumer = this.kafka.consumer({
            groupId: options.groupId,
        });
    }

    async start(): Promise<void> {
        if (this.started) {
            return;
        }

        await this.consumer.connect();

        for (const topic of this.options.topics) {
            await this.consumer.subscribe({
                topic,
                fromBeginning: this.options.fromBeginning ?? false,
            });
        }

        await this.consumer.run({
            eachMessage: async (payload) => {
                await this.handleIncomingMessage(payload);
            },
        });

        this.started = true;
    }

    async stop(): Promise<void> {
        if (!this.started) {
            return;
        }

        await this.consumer.disconnect();
        this.started = false;
    }

    protected abstract handle(
        event: DomainEvent,
        context: {
            topic: string;
            partition: number;
            offset: string;
            key?: string;
        },
    ): Promise<void>;

    private async handleIncomingMessage(payload: EachMessagePayload): Promise<void> {
        const rawValue = payload.message.value?.toString();

        if (!rawValue) {
            return;
        }

        const parsed = JSON.parse(rawValue) as DomainEvent;

        await this.handle(parsed, {
            topic: payload.topic,
            partition: payload.partition,
            offset: payload.message.offset,
            key: payload.message.key?.toString(),
        });
    }
}
