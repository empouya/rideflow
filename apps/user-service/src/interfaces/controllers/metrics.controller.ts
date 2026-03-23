import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('metrics')
export class MetricsController {
    @Get()
    @HttpCode(HttpStatus.OK)
    metrics(): { message: string } {
        return {
            message: 'Prometheus metrics endpoint — to be wired in observability phase',
        };
    }
}