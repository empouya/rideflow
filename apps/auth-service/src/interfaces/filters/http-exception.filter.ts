import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
    EmailAlreadyExistsException,
    InvalidCredentialsException,
    InvalidTokenException,
} from '../../domain/exceptions/auth.exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof EmailAlreadyExistsException) {
            response.status(HttpStatus.CONFLICT).json({
                statusCode: HttpStatus.CONFLICT,
                error: 'Conflict',
                message: exception.message,
            });
            return;
        }

        if (exception instanceof InvalidCredentialsException) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                statusCode: HttpStatus.UNAUTHORIZED,
                error: 'Unauthorized',
                message: exception.message,
            });
            return;
        }

        if (exception instanceof InvalidTokenException) {
            response.status(HttpStatus.UNAUTHORIZED).json({
                statusCode: HttpStatus.UNAUTHORIZED,
                error: 'Unauthorized',
                message: exception.message,
            });
            return;
        }

        if (exception instanceof HttpException) {
            response.status(exception.getStatus()).json(exception.getResponse());
            return;
        }

        console.error('Unhandled exception:', exception);
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
        });
    }
}