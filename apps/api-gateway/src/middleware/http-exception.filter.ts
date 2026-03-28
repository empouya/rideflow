import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { logger } from '../common/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            response.status(status).json(
                typeof body === 'string'
                    ? { statusCode: status, message: body }
                    : body,
            );
            return;
        }

        logger.error({ err: exception }, 'Unhandled gateway exception');
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
        });
    }
}