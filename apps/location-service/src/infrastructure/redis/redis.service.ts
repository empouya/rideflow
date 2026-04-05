import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly redis: Redis;

    constructor(private readonly configService: ConfigService) {
        this.redis = new Redis(
            this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        );
    }

    get client(): Redis {
        return this.redis;
    }

    async onModuleInit(): Promise<void> {
        await this.redis.ping();
    }

    async onModuleDestroy(): Promise<void> {
        await this.redis.quit();
    }
}
