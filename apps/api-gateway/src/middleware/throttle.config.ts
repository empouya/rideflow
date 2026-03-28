import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const defaultThrottleConfig: ThrottlerModuleOptions = {
    throttlers: [
        {
            name: 'global',
            ttl: 60000,
            limit: 100,
        },
    ],
};

export const authThrottleConfig: ThrottlerModuleOptions = {
    throttlers: [
        {
            name: 'auth',
            ttl: 60000,
            limit: 10,
        },
    ],
};