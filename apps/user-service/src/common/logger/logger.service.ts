import pino, { Logger } from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger: Logger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    redact: {
        paths: ['phone', 'avatarUrl'],
        censor: '[REDACTED]',
    },
});