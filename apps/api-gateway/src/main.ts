import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './common/logger/logger.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.info({ port }, 'API Gateway started');
}

bootstrap();