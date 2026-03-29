import { Kafka, Producer } from 'kafkajs';
import { KafkaConnectionOptions } from '../config/kafka.config';
import { DomainEvent } from '../types/domain-event';

export class KafkaEventPublisher {
    private readonly kafka: Kafka;
    private readonly producer: Producer;
    private connected = false;

    constructor(private readonly options: KafkaConnectionOptions) {
        this.kafka = new Kafka({
            clientId: options.clientId,
            brokers: options.brokers,
        });

        this.producer = this.kafka.producer();
    }

    async connect(): Promise<void> {
        if (this.connected) {
            return;
        }

        await this.producer.connect();
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this.connected) {
            return;
        }

        await this.producer.disconnect();
        this.connected = false;
    }

    async publish(event: DomainEvent): Promise<void> {
        await this.connect();

        await this.producer.send({
            topic: event.eventType,
            messages: [
                {
                    key: this.resolveMessageKey(event),
                    value: JSON.stringify(event),
                },
            ],
        });
    }

    private resolveMessageKey(event: DomainEvent): string {
        const payload = event.payload as Record<string, unknown>;
        const userId = payload.userId;

        if (typeof userId === 'string' && userId.length > 0) {
            return userId;
        }

        return event.eventType;
    }
}
