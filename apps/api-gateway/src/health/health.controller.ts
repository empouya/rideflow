import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ServiceHealth {
    status: 'ok' | 'degraded';
}

interface HealthResponse {
    status: 'ok' | 'degraded';
    timestamp: string;
    service: string;
    downstream: Record<string, 'ok' | 'degraded'>;
}

@Controller('health')
export class HealthController {
    constructor(private readonly config: ConfigService) { }

    @Get()
    async check(): Promise<HealthResponse> {
        const services = {
            'auth-service': this.config.getOrThrow<string>('AUTH_SERVICE_URL'),
            'user-service': this.config.getOrThrow<string>('USER_SERVICE_URL'),
            'driver-service': this.config.getOrThrow<string>('DRIVER_SERVICE_URL'),
            'location-service': this.config.getOrThrow<string>('LOCATION_SERVICE_URL'),
        };

        const downstream: Record<string, 'ok' | 'degraded'> = {};

        await Promise.all(
            Object.entries(services).map(async ([name, url]) => {
                try {
                    const response = await fetch(`${url}/health`, {
                        signal: AbortSignal.timeout(3000),
                    });
                    downstream[name] = response.ok ? 'ok' : 'degraded';
                } catch {
                    downstream[name] = 'degraded';
                }
            }),
        );

        const overallStatus = Object.values(downstream).every(
            (s) => s === 'ok',
        )
            ? 'ok'
            : 'degraded';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            service: 'api-gateway',
            downstream,
        };
    }
}