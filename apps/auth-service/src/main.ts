import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './interfaces/filters/http-exception.filter';
import { logger } from './common/logger/logger.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.use(
        pinoHttp.default({
            logger,
            redact: ['req.headers.authorization'],
        }),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.info({ port }, 'Auth service started');
}

bootstrap();