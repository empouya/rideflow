import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './middleware/http-exception.filter';
import { logger } from './common/logger/logger.service';
import * as pinoHttp from 'pino-http';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.use(
        pinoHttp.default({
            logger,
            redact: ['req.headers.authorization'],
        }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS ?? '*',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.info({ port }, 'API Gateway started');
}

bootstrap();