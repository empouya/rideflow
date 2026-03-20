import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import {
    ITokenService,
    TOKEN_SERVICE,
} from '../../application/ports/token.service.interface';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: ITokenService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new InvalidTokenException();
        }

        const token = authHeader.slice(7);
        const payload = this.tokenService.verifyAccessToken(token);
        (request as any).user = payload;

        return true;
    }
}