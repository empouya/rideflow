import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
    DriverLocationNotFoundException,
    InvalidCoordinatesException,
} from '../../domain/exceptions/location.exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();

        if (exception instanceof InvalidCoordinatesException) {
            response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
                message: exception.message,
            });
            return;
        }

        if (exception instanceof DriverLocationNotFoundException) {
            response.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: exception.message,
            });
            return;
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const payload = exception.getResponse();

            response.status(status).json(
                typeof payload === 'string'
                    ? {
                        statusCode: status,
                        error: exception.name,
                        message: payload,
                    }
                    : payload,
            );
            return;
        }

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
            message: 'Unexpected error occurred',
        });
    }
}
