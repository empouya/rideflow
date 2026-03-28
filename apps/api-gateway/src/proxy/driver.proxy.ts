import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { ConfigService } from '@nestjs/config';

export function createDriverProxy(config: ConfigService) {
    return createProxyMiddleware({
        target: config.getOrThrow<string>('DRIVER_SERVICE_URL'),
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.removeHeader('expect');
                fixRequestBody(proxyReq, req);
            },
            error: (err, req, res: any) => {
                res.status(502).json({
                    statusCode: 502,
                    error: 'Bad Gateway',
                    message: 'Driver service is unavailable',
                });
            },
        },
    });
}