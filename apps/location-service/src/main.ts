import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { logger } from './common/logger/logger.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.use(
        pinoHttp.default({
            logger,
        }),
    );

    const port = process.env.PORT ?? 3004;
    await app.listen(port);
    logger.info({ port }, 'Location service started');
}

bootstrap();
