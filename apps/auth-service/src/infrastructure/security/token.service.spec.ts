import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions';

const mockConfigService = {
    getOrThrow: (key: string): string => {
        const config: Record<string, string> = {
            JWT_ACCESS_SECRET: 'test_access_secret',
            JWT_REFRESH_SECRET: 'test_refresh_secret',
            JWT_ACCESS_EXPIRES_IN: '15m',
            JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
    },
} as unknown as ConfigService;

describe('TokenService', () => {
    let service: TokenService;

    beforeEach(() => {
        service = new TokenService(mockConfigService);
    });

    it('should generate an access and refresh token pair', () => {
        const pair = service.generateTokenPair({
            userId: 'user-123',
            email: 'test@rideflow.com',
        });
        expect(pair.accessToken).toBeDefined();
        expect(pair.refreshToken).toBeDefined();
    });

    it('should verify a valid access token and return the payload', () => {
        const pair = service.generateTokenPair({
            userId: 'user-123',
            email: 'test@rideflow.com',
        });
        const payload = service.verifyAccessToken(pair.accessToken);
        expect(payload.userId).toBe('user-123');
        expect(payload.email).toBe('test@rideflow.com');
    });

    it('should verify a valid refresh token and return the payload', () => {
        const pair = service.generateTokenPair({
            userId: 'user-123',
            email: 'test@rideflow.com',
        });
        const payload = service.verifyRefreshToken(pair.refreshToken);
        expect(payload.userId).toBe('user-123');
        expect(payload.email).toBe('test@rideflow.com');
    });

    it('should throw InvalidTokenException for an invalid access token', () => {
        expect(() => service.verifyAccessToken('invalid.token.here')).toThrow(
            InvalidTokenException,
        );
    });

    it('should throw InvalidTokenException for an invalid refresh token', () => {
        expect(() => service.verifyRefreshToken('invalid.token.here')).toThrow(
            InvalidTokenException,
        );
    });

    it('should throw InvalidTokenException when verifying access token with wrong secret', () => {
        const pair = service.generateTokenPair({
            userId: 'user-123',
            email: 'test@rideflow.com',
        });
        expect(() => service.verifyRefreshToken(pair.accessToken)).toThrow(
            InvalidTokenException,
        );
    });
});