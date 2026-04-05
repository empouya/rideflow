import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { logger } from './common/logger/logger.service';
import { GlobalExceptionFilter } from './interfaces/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.use(
        pinoHttp.default({
            logger,
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

    const port = process.env.PORT ?? 3004;
    await app.listen(port);
    logger.info({ port }, 'Location service started');
}

bootstrap();
