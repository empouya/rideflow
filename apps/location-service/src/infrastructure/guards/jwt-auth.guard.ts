import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.slice(7);

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET as string,
            ) as {
                userId: string;
                email: string;
            };

            request.user = {
                userId: decoded.userId,
                email: decoded.email,
            };

            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
