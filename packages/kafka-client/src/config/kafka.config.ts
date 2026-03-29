export interface KafkaConnectionOptions {
    clientId: string;
    brokers: string[];
}

export function parseKafkaBrokers(value: string): string[] {
    return value
        .split(',')
        .map((broker) => broker.trim())
        .filter((broker) => broker.length > 0);
}

export function buildKafkaConnectionOptions(input: {
    clientId: string;
    brokerList: string;
}): KafkaConnectionOptions {
    const brokers = parseKafkaBrokers(input.brokerList);

    if (brokers.length === 0) {
        throw new Error('Kafka broker list cannot be empty');
    }

    return {
        clientId: input.clientId,
        brokers,
    };
}
