import rateLimit from 'express-rate-limit';

export const globalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again after a minute',
    },
    skip: (req) => req.path === '/health',
});

export const authRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Too many authentication attempts, please try again after a minute',
    },
});