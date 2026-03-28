import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
    userId: string;
    email: string;
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
    constructor(private readonly config: ConfigService) { }

    use(req: Request, res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.slice(7);

        try {
            const payload = jwt.verify(
                token,
                this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
            ) as JwtPayload;

            (req as any).user = payload;
            next();
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}