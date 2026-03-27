import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
    DriverAlreadyExistsException,
    DriverComplianceConflictException,
    DriverEligibilityException,
    DriverNotFoundException,
} from '../../domain/exceptions/driver.exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof DriverNotFoundException) {
            response.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: exception.message,
            });
            return;
        }

        if (
            exception instanceof DriverAlreadyExistsException
            || exception instanceof DriverComplianceConflictException
        ) {
            response.status(HttpStatus.CONFLICT).json({
                statusCode: HttpStatus.CONFLICT,
                error: 'Conflict',
                message: exception.message,
            });
            return;
        }

        if (exception instanceof DriverEligibilityException) {
            response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                error: 'Unprocessable Entity',
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
