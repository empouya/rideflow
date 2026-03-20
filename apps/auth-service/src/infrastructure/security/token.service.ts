import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import {
    ITokenService,
    TokenPair,
    TokenPayload,
} from '../../application/ports/token.service.interface';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions';

@Injectable()
export class TokenService implements ITokenService {
    constructor(private readonly config: ConfigService) { }

    generateTokenPair(payload: TokenPayload): TokenPair {
        const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
        const accessExpiresIn = this.config.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as StringValue;
        const refreshExpiresIn = this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as StringValue;

        const accessToken = jwt.sign(
            { userId: payload.userId, email: payload.email },
            accessSecret,
            { expiresIn: accessExpiresIn },
        );

        const refreshToken = jwt.sign(
            { userId: payload.userId, email: payload.email },
            refreshSecret,
            { expiresIn: refreshExpiresIn },
        );

        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(
                token,
                this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
            ) as TokenPayload;
            return { userId: decoded.userId, email: decoded.email };
        } catch {
            throw new InvalidTokenException();
        }
    }

    verifyRefreshToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(
                token,
                this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            ) as TokenPayload;
            return { userId: decoded.userId, email: decoded.email };
        } catch {
            throw new InvalidTokenException();
        }
    }
}